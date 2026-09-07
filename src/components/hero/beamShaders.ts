/**
 * Feixe de luz — WebGL2.
 *
 * Uma linha central ondulante (soma de senos animada no tempo) define a
 * geometria. A distância vertical até essa linha vira intensidade: núcleo fino
 * e brilhante + brilho largo e suave. A aberração cromática vem de varrer
 * offsets verticais, cada um com sua cor no espectro. Um viés horizontal tinge
 * de quente (laranja) à esquerda para frio (azul/ciano) à direita, e o núcleo
 * satura para branco. O fundo fica transparente para compor sobre o hero.
 */

export const BEAM_VERT = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;

export const BEAM_FRAG = `#version 300 es
precision highp float;
out vec4 o;
uniform vec2  uRes;
uniform float uT;

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

  // LATERAIS MAIS LARGAS: espessura fina no centro, aumenta muito nas bordas
  float edge = abs(uv.x - 0.5) * 2.0;              // 0 centro -> 1 bordas
  float spread = 1.0 + 4.5 * pow(edge, 1.7);       // fator de abertura lateral
  float w = (0.010 + 0.004*sin(uv.x*5.0 + t*0.3)) * spread;

  // vies horizontal de matiz: quente a direita, frio a esquerda
  float hbias = (uv.x - 0.5) * 0.55;

  // --- DISPERSAO DE PRISMA: varre offsets verticais, cada um com sua cor ---
  vec3 col = vec3(0.0);
  const int N = 9;
  float disp = w * 2.2;                            // abertura do espectro (segue a largura)
  for(int i=0;i<N;i++){
    float f   = float(i)/float(N-1);              // 0..1 posicao no espectro
    float off = (f - 0.5) * disp;
    float g   = glow(d - off, w*0.55);
    col += ramp(f - hbias) * g;
  }
  col /= float(N) * 0.5;

  // --- NUCLEO branco-quente, fino ---
  float core = glow(d, w*0.35);
  col = mix(col, vec3(1.0, 0.96, 0.90), core*0.9);

  // --- FIOS DE SEDA: 2 streaks finos deslocados, dao a trama que se cruza ---
  float s1 = glow(d - (0.9*w) - 0.02*sin(uv.x*7.0 - t*0.6), w*0.5);
  float s2 = glow(d + (0.9*w) + 0.02*sin(uv.x*6.0 + t*0.5 + 2.0), w*0.5);
  col += ramp(0.30 - hbias) * s1 * 0.6;   // fio quente
  col += ramp(0.75 - hbias) * s2 * 0.6;   // fio frio

  // --- NEVOA: camadas de bloom largas que tingem o fundo ---
  vec3 warmFog = vec3(1.00, 0.45, 0.16);
  vec3 coolFog = vec3(0.28, 0.55, 1.00);
  vec3 fogCol  = mix(coolFog, warmFog, smoothstep(0.15, 0.9, uv.x));
  float haze1 = glow(d, w*7.0)  * 0.45;   // nevoa proxima
  float haze2 = glow(d, w*18.0) * 0.22;   // nevoa atmosferica ampla
  float haze3 = glow(d, w*40.0) * 0.10;   // brilho difuso que preenche o quadro
  col += fogCol * (haze1 + haze2 + haze3);

  // --- GRAO de filme + dithering (mata banding, da textura cinematografica) ---
  float n = hash(gl_FragCoord.xy + t*60.0);
  col += (n - 0.5) * 0.025;

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
