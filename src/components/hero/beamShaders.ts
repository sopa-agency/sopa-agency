/**
 * Feixe de luz — WebGL2.
 *
 * Uma linha central ondulante (soma de senos animada no tempo) define a
 * geometria. A distância vertical até essa linha vira intensidade: núcleo fino
 * e brilhante + brilho largo e suave. A aberração cromática vem de varrer
 * offsets verticais, cada um com sua cor no espectro. Um viés horizontal tinge
 * de quente (laranja) à esquerda para frio (azul/ciano) à direita, e o núcleo
 * satura para branco. O fundo fica transparente para compor sobre o hero.
 *
 * `uB` (0→1) é a ABERTURA, dirigida pelo scroll. O feixe não sai de cena
 * apagando nem descendo: ele arrebenta. As duas metades se afastam do centro,
 * borram enquanto voam e somem pelo topo e pelo pé do quadro, devolvendo o
 * preto do card pelo meio. Em `uB = 0` nada disso acontece e o desenho é o de
 * sempre — é assim que o feixe do rodapé, que não recebe scroll, continua
 * idêntico ao que era.
 */

export const BEAM_VERT = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;

export const BEAM_FRAG = `#version 300 es
precision highp float;
out vec4 o;
uniform vec2  uRes;
uniform float uT;
uniform float uB;   // abertura: 0 = feixe parado, 1 = ja saiu de cena

// glow gaussiano de um filamento à distancia d, espessura w
float glow(float d, float w){ return exp(-(d*d)/(w*w)); }

// ruido barato p/ grao de filme
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

// rampa espectral: quente -> ambar -> branco -> ciano -> azul (luz dispersa)
vec3 ramp(float s){
  s = clamp(s, 0.0, 1.0);
  vec3 warm  = vec3(1.00, 0.28, 0.06);
  vec3 amber = vec3(1.00, 0.66, 0.22);
  vec3 white = vec3(1.00, 0.98, 0.95);
  vec3 cyan  = vec3(0.42, 0.85, 1.00);
  vec3 blue  = vec3(0.18, 0.42, 1.00);
  if(s < 0.25) return mix(warm,  amber, s/0.25);
  if(s < 0.50) return mix(amber, white,(s-0.25)/0.25);
  if(s < 0.75) return mix(white, cyan, (s-0.50)/0.25);
  return               mix(cyan,  blue, (s-0.75)/0.25);
}

// linha central: S bem suave, quase reta, com leve subida no meio
float centerline(float x, float t){
  float y = 0.0;
  y += 0.026 * sin(x*3.1416*1.1 + t*0.22);
  y += 0.014 * sin(x*3.1416*2.3 - t*0.18 + 1.0);
  y += (x-0.5) * 0.06;                          // inclinacao geral leve
  y -= 0.022 * exp(-pow((x-0.5)*3.2, 2.0));     // pequena elevacao central
  return y;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;   // 0..1
  float t = uT;

  float cy = 0.5 + centerline(uv.x, t);
  float d  = uv.y - cy;               // distancia vertical assinada

  // --- ABERTURA -----------------------------------------------------------
  // "dr" desloca o campo para FORA: acima da linha central subtrai o raio,
  // abaixo soma. O perfil inteiro do feixe passa a existir em duas copias, uma
  // em +R e outra em -R, cada uma guardando a orientacao do espectro original.
  // Em b = 0 o deslocamento e zero e "dr" e literalmente "d" — nenhum dos
  // termos abaixo muda nada enquanto o scroll nao comeca.
  float b     = clamp(uB, 0.0, 1.0);
  // Expoente ACIMA de 1: o raio quase nao anda no comeco e dispara no fim. Com
  // uma curva desacelerando (expoente < 1) o feixe ja tinha saido do quadro no
  // primeiro terco do gesto e ninguem via o rasgo — so notava a ausencia.
  float R     = pow(b, 1.6) * 0.95;
  float wGrow = 1.0 + b * b * 4.0;    // e perde definicao enquanto voa
  float dr    = d - sign(d) * R;

  // LATERAIS MAIS LARGAS: espessura fina no centro, aumenta muito nas bordas
  float edge = abs(uv.x - 0.5) * 2.0;              // 0 centro -> 1 bordas
  float spread = 1.0 + 4.5 * pow(edge, 1.7);       // fator de abertura lateral
  float w = (0.010 + 0.004*sin(uv.x*5.0 + t*0.3)) * spread * wGrow;

  // vies horizontal de matiz: quente a direita, frio a esquerda
  float hbias = (uv.x - 0.5) * 0.55;

  // --- DISPERSAO DE PRISMA: varre offsets verticais, cada um com sua cor ---
  vec3 col = vec3(0.0);
  const int N = 9;
  float disp = w * 2.2;                            // abertura do espectro (segue a largura)
  for(int i=0;i<N;i++){
    float f   = float(i)/float(N-1);              // 0..1 posicao no espectro
    float off = (f - 0.5) * disp;
    float g   = glow(dr - off, w*0.55);
    col += ramp(f - hbias) * g;
  }
  col /= float(N) * 0.5;

  // --- NUCLEO branco-quente, fino ---
  float core = glow(dr, w*0.35);
  col = mix(col, vec3(1.0, 0.96, 0.90), core*0.9);

  // --- FIOS DE SEDA: 2 streaks finos deslocados, dao a trama que se cruza ---
  float s1 = glow(dr - (0.9*w) - 0.02*sin(uv.x*7.0 - t*0.6), w*0.5);
  float s2 = glow(dr + (0.9*w) + 0.02*sin(uv.x*6.0 + t*0.5 + 2.0), w*0.5);
  col += ramp(0.30 - hbias) * s1 * 0.6;   // fio quente
  col += ramp(0.75 - hbias) * s2 * 0.6;   // fio frio

  // --- NEVOA: camadas de bloom largas que tingem o fundo ---
  vec3 warmFog = vec3(1.00, 0.45, 0.16);
  vec3 coolFog = vec3(0.28, 0.55, 1.00);
  vec3 fogCol  = mix(coolFog, warmFog, smoothstep(0.15, 0.9, uv.x));
  float haze1 = glow(dr, w*7.0)  * 0.45;   // nevoa proxima
  float haze2 = glow(dr, w*18.0) * 0.22;   // nevoa atmosferica ampla
  float haze3 = glow(dr, w*40.0) * 0.10;   // brilho difuso que preenche o quadro
  // A nevoa morre ANTES das bandas. Ela e larga demais para se abrir junto: se
  // acompanhasse a abertura, o quadro inteiro so clarearia e o preto nunca
  // voltaria pelo meio, que e o ponto do efeito.
  col += fogCol * (haze1 + haze2 + haze3) * (1.0 - smoothstep(0.12, 0.6, b));

  // --- CLARAO: o instante em que a luz satura e perde a cor ---------------
  // Um pico so, no comeco da abertura. O "smoothstep" da frente e o que
  // garante que em b = 0 ele vale exatamente zero — a gaussiana sozinha ainda
  // valeria 0.3 no repouso e clarearia o feixe parado.
  float flash = smoothstep(0.0, 0.04, b) * exp(-pow((b - 0.30) / 0.18, 2.0));
  col *= 1.0 + 1.6 * flash;
  col = mix(col, vec3(max(max(col.r, col.g), col.b)), flash * 0.8);

  // --- O MIOLO DEVOLVE O PRETO --------------------------------------------
  // Mascara que nasce nula e cresce junto com o raio: o que estiver a menos de
  // 0.62 R do centro e apagado, com a borda amolecendo conforme abre.
  float hole = mix(
    1.0,
    smoothstep(0.0, 0.06 + 0.35*b, abs(d) - R*0.70),
    smoothstep(0.03, 0.30, b)
  );
  col *= hole;

  // e no fim nao sobra nada para a cena seguinte
  float gone = 1.0 - smoothstep(0.72, 1.0, b);
  col *= gone;

  // --- GRAO de filme + dithering (mata banding, da textura cinematografica) ---
  // Some junto: ele pinta o quadro inteiro com alfa baixo, e sozinho deixaria
  // uma poeira luminosa sobre o card depois que o feixe ja foi embora.
  float n = hash(gl_FragCoord.xy + t*60.0);
  col += (n - 0.5) * 0.025 * gone;

  // --- BORDAS de cima e de baixo somem ---
  // A nevoa larga e o grao pintam o quadro INTEIRO, com alpha baixo mas nao
  // nulo. Sem este esmaecimento a faixa acaba num corte reto na altura em que
  // o canvas termina, e a linha atravessa o hero de ponta a ponta parecendo
  // uma barra. O feixe mora no meio do quadro, entao nada dele se perde aqui.
  col *= smoothstep(0.0, 0.16, uv.y) * smoothstep(0.0, 0.16, 1.0 - uv.y);

  // intensidade -> alpha (compoe sobre o hero escuro)
  float a = clamp(max(max(col.r,col.g),col.b), 0.0, 1.0);
  a = pow(a, 0.85);

  o = vec4(max(col, 0.0), a);
}`;
