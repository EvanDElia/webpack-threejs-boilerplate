/* eslint-env browser */
require('./styles.less');
import {Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial, MeshStandardMaterial, Mesh, MeshLambertMaterial} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FaceMeshFaceGeometry } from './face.js';
import {CodeKeyframes} from './codeKeyframes.js';

import * as THREE from 'three';
const $ = require('jquery');

const scene = new Scene();
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new WebGLRenderer({ preserveDrawingBuffer: true });
var controls;
var video, model, Facemesh;

const geometry = new BoxGeometry(1, 1, 1);
const material = new MeshStandardMaterial({color: 0x00ff00});
const cube = new Mesh(geometry, material);
const fftCubes = new Array();


function onWindowResize() {

    // windowHalfX = window.innerWidth / 2;
    // windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    // composer.reset();

}

async function init() {
    model = await facemesh.load( { maxFaces: 1 } );

    var Facegeometry = new FaceMeshFaceGeometry();
    Facegeometry.setSize( video.videoWidth, video.videoHeight );
    
    var Facematerial = new THREE.MeshStandardMaterial( {
        map: new THREE.VideoTexture( video ),
        side: THREE.DoubleSide
    } );

    Facemesh = new THREE.Mesh( Facegeometry, Facematerial );
    scene.add( Facemesh );
    Facemesh.position.z = -2;
    Facemesh.position.y = -6;
    Facemesh.scale.x = Facemesh.scale.y = Facemesh.scale.z = 10;

    //------------------------------------
	$('#overlay').hide();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	scene.add(cube);

    camera.position.z = 5;

    const color = 0xFFFFFF;
    const intensity = 1;
    const dlight = new THREE.DirectionalLight(color, intensity);
    dlight.position.set(0, 10, 5);
    dlight.target.position.set(-5, 0, 0);
    scene.add(dlight);
    scene.add(dlight.target);

    //ambient light
    var ambient = new THREE.AmbientLight( 0xffaaaa, 0.55 );
    scene.add( ambient );

    var light = new THREE.PointLight( 0xff0000, 1, 100 );
    light.position.set( 5, 5, 5 );
    scene.add( light );

    //set orbit controls
    controls = new OrbitControls( camera, renderer.domElement );
    controls.enableZoom = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.15;
    controls.update();

    // trails
    // renderer.autoClearColor = false;
    // renderer.autoClear = false;

    // postprocessing effects
    // var renderModel = new RenderPass( scene, camera );
    // effectBloom = new BloomPass( 1.0, 10, 1.0, 2048); //needs to be a gloabal value so we can change it in the animate function
    // var effectBleach = new ShaderPass( BleachBypassShader );
    // var effectCopy = new ShaderPass( CopyShader );

    // effectBleach.uniforms[ "opacity" ].value = 0.7;

    // effectCopy.renderToScreen = true;

    // composer = new EffectComposer( renderer );

    // composer.addPass( renderModel );
    // composer.addPass( effectBleach );
    // composer.addPass( effectBloom );
    // composer.addPass( effectCopy );

    window.addEventListener( 'resize', onWindowResize, false );

    var listener = new THREE.AudioListener();
    camera.add( listener );

    // // create a global audio source
    // var sound = new THREE.Audio( listener );
    // // load a sound and set it as the Audio object's buffer
    // var audioLoader = new THREE.AudioLoader();

    // new MusicApp(tracks, audioLoader, sound);

    // CODE KEYFRAMES INIT
    var ckf = new CodeKeyframes({
        audioPath:     'https://evandelia.com/blackbird/tracks/01%20Neon%20Night.mp3',
        editorOpen:    true,
        waveColor:     '#3AEAD2', // wave color right of the playhead
        progressColor: '#0c9fa7', // wave color left of the playhead
        bgColor:       '#222',    // color behind waveform
        label:         'Text that appears above the waveform',
        autoplay:      false,
        keyframes:     [{"start":"1.00","end":"1.10","data":{"code":"console.log('this is a keyframe');","state":{"autoClear":"1"}}},{"start":"3.04","end":"3.14","data":{"code":"console.log('change auto clear');","state":{"autoClear":"0"}}}], // paste in here after exporting keyframes,

        state: {
            autoClear: "1"
        },
        
        onCanPlay: function(){
            console.log('onCanPlay triggered')
        },
      
        onPlay: function(){
            console.log('onPlay triggered')
        },
      
        onPause: function(){
            console.log('onPause triggered')
        },
      
        onFrame: function(){
            renderer.autoClear = ckf.state.autoClear !== "0";
            renderer.autoClearColor = ckf.state.autoClear !== "0";
            console.log(ckf.state.autoClear !== 0);
            console.log(ckf.state.autoClear);
            console.log(renderer.autoClear);
        }
      });

    document.getElementById('play').onclick = () => {
        ckf.wavesurfer.play();
        $('#play').hide();
        $('#pause').show();
    }
    document.getElementById('pause').onclick = () => {
        ckf.wavesurfer.pause();
        $('#play').show();
        $('#pause').hide();
    }

      // This is to make the wave surfer stuff work with the three js audio analyser
      ckf.wavesurfer.backend.context = ckf.wavesurfer.backend.ac
      ckf.wavesurfer.backend.getOutput = () => {return ckf.wavesurfer.backend.gainNode}

    var analyser = new THREE.AudioAnalyser( ckf.wavesurfer.backend, 256 ); // sound, 256
    window.analyser = analyser;
    var bufferSize = analyser.data.length;
    for (var i = 0; i < bufferSize / 2; i++) {
        var bin = new THREE.Mesh(new THREE.BoxGeometry(bufferSize / window.innerWidth * 4, bufferSize / window.innerWidth, 2), material);
        bin.position.z = -10;
        bin.position.x = -10 + (bufferSize / window.innerWidth * i) * 4;
        bin.position.y = -2;
        fftCubes.push(bin)
        scene.add(bin);
    }

    //////////

    render();
}

async function startVideo(){
    let constraints = { video: { facingMode: 'user' } };
    let stream = await navigator.mediaDevices.getUserMedia( constraints );
    
    video = document.createElement( 'video' );
    video.srcObject = stream;        
    video.onloadedmetadata = function () {
        video.play();
        init();
    };
}

$(document).ready(function(){
    document.getElementById('startButton').innerHTML = 'Click to Play';
    document.getElementById('startButton').onclick = () => {
        startVideo();
    }
})

async function render(){
    const faces = await model.estimateFaces( video, false, true );
        
    if ( faces.length > 0 ) {
        Facemesh.geometry.update( faces[ 0 ], true );
    }

    //-----------------------------
	cube.rotation.x += 0.1;
    cube.rotation.y += 0.1;
    // console.log(window.analyser.getAverageFrequency());
    for (var i = 0; i < fftCubes.length; i++) {
        // console.log(window.analyser.data);
        window.analyser.getFrequencyData(window.analyser.data);
        fftCubes[i].position.y = window.analyser.data[i]/50;
    }
    renderer.render(scene, camera);
    controls.update();
    requestAnimationFrame(render);
}

// render();
