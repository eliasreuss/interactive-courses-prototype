import {continueRender, delayRender, staticFile} from 'remotion';

const weights: [string, number][] = [
  ['Regular', 400],
  ['Medium', 500],
  ['SemiBold', 600],
  ['Bold', 700],
];

const handle = delayRender('Loading Poppins');

Promise.all(
  weights.map(([name, weight]) => {
    const face = new FontFace('Poppins', `url(${staticFile(`fonts/Poppins-${name}.ttf`)}) format('truetype')`, {weight: String(weight)});
    return face.load().then((loaded) => document.fonts.add(loaded));
  }),
)
  .then(() => continueRender(handle))
  .catch((err) => {
    console.error(err);
    continueRender(handle);
  });
