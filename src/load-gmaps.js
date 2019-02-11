export default function loadScript(url) {
  const script = document.createElement( 'script' );
  script.id = 'decoder_script';
  script.type = 'text/javascript';
  script.src = url;
  const head = document.getElementsByTagName( 'head' )[ 0 ];
  head.appendChild( script );

  return new Promise(resolve => {
    script.onload = resolve;
  });
};
