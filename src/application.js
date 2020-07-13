/* eslint-env browser */
require('./styles.less');
import {Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial, MeshStandardMaterial, Mesh, MeshLambertMaterial} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FaceMeshFaceGeometry } from './face.js';

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

async function init(tracks) {
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

    // create a global audio source
    var sound = new THREE.Audio( listener );
    // load a sound and set it as the Audio object's buffer
    var audioLoader = new THREE.AudioLoader();

    new MusicApp(tracks, audioLoader, sound);

    var analyser = new THREE.AudioAnalyser( sound, 256 ); // sound, 256
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

class MusicApp {
    constructor(trackList, audioLoader, sound) {
        this.trackList = trackList;
        this.audioLoader = audioLoader;
        this.sound = sound;
        this.initAudio();
        this.initUI();
    }

    initUI() {
        let self = this;

        var $track_container_onInit = $('#info');
         self.trackList.forEach(function(track) {
            $track_container_onInit.append('<div class="song-title">'+ track.trackNumber + '. ' + track.name +'</div>');
        });

        this.controls = {
            prev: document.querySelector('#back'),
            next: document.querySelector('#forward'),
            play: document.querySelector('#play'),
            pause: document.querySelector('#pause'),
        };

        this.controls.prev.onclick = () => {
            $($(".song-title")[self.currentSong]).removeClass("active");
            self.currentSong = self.currentSong > 0 ? self.currentSong - 1 : self.trackList.length - 1;
            $($(".song-title")[self.currentSong]).addClass("active");
            self.sound.stop();
            self.audioLoader.load( self.trackList[self.currentSong].url, function( buffer ) {
                self.sound.setBuffer( buffer );
                self.sound.play();
            });
        };
        this.controls.next.onclick = () => {
            $($(".song-title")[self.currentSong]).removeClass("active");
            self.currentSong = self.currentSong < self.trackList.length - 1 ? self.currentSong + 1 : 0;
            $($(".song-title")[self.currentSong]).addClass("active");
            self.sound.stop();
            self.audioLoader.load( self.trackList[self.currentSong].url, function( buffer ) {
                self.sound.setBuffer( buffer );
                self.sound.play();
            });
        };

        this.controls.play.onclick = () => {
                self.sound.play();
                self.playing = true;
                $(self.controls.play).css('display','none');
                $(self.controls.pause).css('display','block');
        };
        this.controls.pause.onclick = () => {
                self.sound.pause();
                self.playing = false;
                $(self.controls.play).css('display','block');
                $(self.controls.pause).css('display','none');
                
        };

        $($(".song-title")[this.currentSong]).addClass("active");
    }

    initAudio() {
        let self = this;
        this.currentSong = 0;

        self.audioLoader.load( self.trackList[self.currentSong].url, function( buffer ) {
            self.sound.setBuffer( buffer );
            // self.sound.play();
        });

        this.sound.onEnded = () => {
            $($(".song-title")[self.currentSong]).removeClass("active");
            self.currentSong = self.currentSong < self.trackList.length - 1 ? self.currentSong + 1 : 0;
            $($(".song-title")[self.currentSong]).addClass("active");
            self.sound.stop();
            self.audioLoader.load( self.trackList[self.currentSong].url, function( buffer ) {
                self.sound.setBuffer( buffer );
                self.sound.play();
            });
        };
    }
}

async function startVideo(tracks){
    let constraints = { video: { facingMode: 'user' } };
    let stream = await navigator.mediaDevices.getUserMedia( constraints );
    
    video = document.createElement( 'video' );
    video.srcObject = stream;        
    video.onloadedmetadata = function () {
        video.play();
        init(tracks);
    };
}

$.ajax({
	url: "https://evandelia.com/blackbird/tracks.json",
	dataType: "json",
	success: function (response) {
		document.getElementById('startButton').innerHTML = 'Click to Play';
		document.getElementById('startButton').onclick = () => {
			startVideo(response.tracks);
		}
	},
	error: function (response) {
		console.log(response);
		$("#info").html("Error Loading");
	}
});

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
