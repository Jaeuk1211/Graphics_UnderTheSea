

    var gl;
    var tracer = {};

    var idx = 1;

    //necessary extensions
    var OES_texture_float;
    var OES_texture_float_linear;
    var OES_texture_half_float;
    var OES_texture_half_float_linear;
    var OES_standard_derivatives;
    var WEBGL_draw_buffers;
    var WEBGL_depth_texture;

    var startBoolean = 1;
    var rainaudio;
    var leakaudio;

   // shader programs
    var poolProg;
    var skyProg;
    var waterProg = [];
    var heightProg;
    var causticProg;
    var normalProg;
    var simulateProg;
    var objProg = [];
    var objectProg = [];
    var depthProg;
    var windProg;
    var rainProg;
    var godrayProg;

    var postProg;

    var reflectProg;
    
    //rendering
    var framebuffer;
    var renderbuffer;
    var framebuffer1;
    var renderbuffer1;
    var textureSize = 256;
    var textureSize1 = 512;
    var textureSize2 = 1024; // Sky background size

    // matrices
    var mvMatrix = mat4.create();
    var mvMatrixStack = [];
    var pMatrix = mat4.create();
    var nmlMatrix = mat4.create();
    var eyePos;
    var radius = 4.0;
    var azimuth = 0.5*Math.PI;
    var elevation = 0.5;
    var fov = 45.0;
    var eye = sphericalToCartesian(radius, azimuth, elevation);
    var center = [0.0, 0.0, 0.0];
    var up = [0.0, 1.0, 0.0];
    var view = mat4.create();
    mat4.lookAt(eye, center, up, view);

    //fps
    var numFramesToAverage = 16;
    var frameTimeHistory = [];
    var frameTimeIndex = 0;
    var totalTimeForFrames = 0;
    var then = Date.now() / 1000;

    // animating 
    var accumTime = 0;

    var clickObject = 0;

    //mouse interaction
    var time = 0;
    var mouseLeftDown = false;
    var mouseRightDown = false;
    var lastMouseX = null;
    var lastMouseY = null;

    // var preHit = vec3.create(0.0);
    var preHit = [];
    // var preHit = [];
   //var nxtHit = vec3.create(0.0);
    var viewportNormal = vec3.create(0.0);
    var mode = 0;   // 0- mouse click interaction, 1-sphere interaction


    var pool = {};    //a cube without top plane
    var sky = {};    //a cube
    var water = {};   //a plane
    var quad = {};

    var sphere = [];
    var objRaw = [];     //raw primitive data for obj loading

    var objModel = [];    //processed gl object data for obj
    var depthModel = [];   //put tmp necessary vbo, ibo info into this object, for drawing depth

    // for drawing depth
    // var fishCount = 1;
    var nowObjectNumber = 0;
    var fishNumbers=[1, 2, 3, 4, 5, 16, 17, 20, 21, 22, 23, 24, 25, 26];
    var fishEachsize = [0.001, 0.001, 0.001, 0.001, 0.001, 0.5, 0.004, 0.4, 0.005, 0.008, 0.008, 0.008, 0.006, 0.005]; // 16
    
    // Initial Objects 
    var fishCount = 4;
    var fishes=[16,20,21,1];
    var size = [0.01, 0.6, 0.5, 0.001]; // 16 17 20 21 26
    
    var depthTexture = [];    //for light-based depth rendering
    var colorTexture;     //for light-based depth rendering
    var depthTexture2;   //for camera-based depth rendering
    var colorTexture2;   //for camera-based depth rendering
    var depthTexture3;   //for reflection-based depth rendering
    var colorTexture3;   //for reclection-based depth rendering
    var lightInvDir = vec3.normalize(vec3.create([0.5, 1.2, 0.3]));
    var lightMatrix = mat4.create();   //model view matrix for light
    var lightProj = mat4.create();   //projection matrix for light
    var reflectProj = mat4.create();
    var reflectModelView = mat4.create();

    var perm  = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225,
                140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148,
                247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32,
                57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175,
                74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122,
                60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54,
                65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169,
                200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64,
                52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212,
                207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213,
                119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
                129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104,
                218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241,
                81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157,
                184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93,
                222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180 ];

    // Wind animation
    var grad = [  1,1,0,    -1,1,0,    1,-1,0,    -1,-1,0,
                  1,0,1,    -1,0,1,    1,0,-1,    -1,0,-1,
                  0,1,1,    0,-1,1,    0,1,-1,    0,-1,-1,
                  1,1,0,    0,-1,1,    -1,1,0,    0,-1,-1 ]; 

    var permTexture;
    var gradTexture;

    var objTexture = [];
    var reflectTexture;

    //user input
    var u_CausticOnLocation;
    var isSphere;
    var sphereRadius;
    var currentPoolPattern;
    var isGodray;

    var rainCounter = 0;
    var flag = 1;

    function sphericalToCartesian( r, a, e ) {
        var x = r * Math.cos(e) * Math.cos(a);
        var y = r * Math.sin(e);
        var z = r * Math.cos(e) * Math.sin(a);

        return [x,y,z];
    }

    function initGL(canvas) {
        try {
            gl = canvas.getContext("experimental-webgl");
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
        } catch (e) {
        }
        if (!gl) {
            alert("Initializing WebGL failed.");
        }
    }


    function getShader(gl, id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }

        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    var parameters = new function(){
        this.Caustic = true;

        this.Object = "duck";
        // this.Pool_Pattern = "white brick";
        this.Pool_Pattern = "marble";
        this.Sphere_Radius = 0.25;        
        this.Wind = true;
        this.Rain = false;
        this.Depth_From_Light = false;
        this.Depth_From_Camera = false;
        
        this.God_rays = false;
        this.Reflection_Texture = false;
        this.Draw_Obj_Reflection = false;    
    }


    function initShaders() {
     //-----------------------pool------------------------------
        poolProg = gl.createProgram();
        gl.attachShader(poolProg, getShader(gl, "pool-vs") );
        gl.attachShader( poolProg, getShader(gl, "pool-fs") );
        gl.linkProgram(poolProg);

        if (!gl.getProgramParameter(poolProg, gl.LINK_STATUS)) {
            alert("Could not initialize pool shader.");
        }
        gl.useProgram(poolProg);

        poolProg.vertexPositionAttribute = gl.getAttribLocation(poolProg, "aVertexPosition");
        poolProg.textureCoordAttribute = gl.getAttribLocation(poolProg, "aTextureCoord");
        poolProg.vertexNormalAttribute = gl.getAttribLocation(poolProg, "aVertexNormal");

        poolProg.pMatrixUniform = gl.getUniformLocation(poolProg, "uPMatrix");
        poolProg.mvMatrixUniform = gl.getUniformLocation(poolProg, "uMVMatrix");
        poolProg.nmlMatrixUniform = gl.getUniformLocation(poolProg, "uNmlMatrix");
        poolProg.lightMatrixUniform = gl.getUniformLocation(poolProg, "uLightMatrix");
        poolProg.lightProjUniform = gl.getUniformLocation(poolProg, "uLightProj");
        poolProg.samplerTileUniform = gl.getUniformLocation(poolProg, "uSamplerTile");
        poolProg.samplerWaterUniform = gl.getUniformLocation(poolProg, "uSamplerWater");
        poolProg.samplerCausticUniform = gl.getUniformLocation(poolProg, "uSamplerCaustic");
        poolProg.samplerDepthUniform = gl.getUniformLocation(poolProg, "uSamplerDepth");

        poolProg.samplerGodrayUniform = gl.getUniformLocation(poolProg, "uSamplerGodray");
        poolProg.sphereRadiusUniform = gl.getUniformLocation(poolProg, "uSphereRadius");
        poolProg.sphereCenterUniform = gl.getUniformLocation(poolProg, "uSphereCenter");
        poolProg.causticOnUniform = gl.getUniformLocation(poolProg, "uCausticOn");
        poolProg.isSphereUniform = gl.getUniformLocation(poolProg, "uIsSphere");



    // set object attributes as mush as object count
    // -----------------------sphere[i]------------------------------
    for (var i = 0; i < fishCount; i++) {
        setObjectAttribute(i);
    }

     //-----------------------sky------------------------------
        skyProg = gl.createProgram();
        gl.attachShader(skyProg, getShader(gl, "sky-vs") );
        gl.attachShader( skyProg, getShader(gl, "sky-fs") );
        gl.linkProgram(skyProg);

        if (!gl.getProgramParameter(skyProg, gl.LINK_STATUS)) {
            alert("Could not initialize sky shader.");
        }
        gl.useProgram(skyProg);

        skyProg.vertexPositionAttribute = gl.getAttribLocation(skyProg, "aVertexPosition");

        skyProg.pMatrixUniform = gl.getUniformLocation(skyProg, "uPMatrix");
        skyProg.mvMatrixUniform = gl.getUniformLocation(skyProg, "uMVMatrix");
        skyProg.samplerSkyUniform = gl.getUniformLocation(skyProg, "uSamplerSky");

        //-----------------------water---------------------------------
        for(var i=0; i<2; i++){

            waterProg[i] = gl.createProgram();
            gl.attachShader(waterProg[i], getShader(gl, "water-vs") );
            gl.attachShader(waterProg[i], getShader(gl, "water-fs") );
            gl.linkProgram(waterProg[i]);

            if (!gl.getProgramParameter(waterProg[i], gl.LINK_STATUS)) {
                alert("Could not initialize water shader.");
            }
            gl.useProgram(waterProg[i]);

            waterProg[i].vertexPositionAttribute = gl.getAttribLocation(waterProg[i], "aVertexPosition");
            waterProg[i].vertexNormalAttribute = gl.getAttribLocation(waterProg[i], "aVertexNormal");
            //waterProg.textureCoordAttribute = gl.getAttribLocation(waterProg, "aTextureCoord");

            waterProg[i].pMatrixUniform = gl.getUniformLocation(waterProg[i], "uPMatrix");
            waterProg[i].mvMatrixUniform = gl.getUniformLocation(waterProg[i], "uMVMatrix");
            waterProg[i].rmvMatrixUniform = gl.getUniformLocation(waterProg[i], "uReflectpMatrix");
            waterProg[i].rpMatrixUniform = gl.getUniformLocation(waterProg[i], "uReflectmvMatrix");
            waterProg[i].samplerSkyUniform = gl.getUniformLocation(waterProg[i], "uSamplerSky");
            waterProg[i].samplerTileUniform = gl.getUniformLocation(waterProg[i], "uSamplerTile");
            waterProg[i].samplerWaterUniform = gl.getUniformLocation(waterProg[i], "uSamplerWater");
            waterProg[i].samplerCausticUniform = gl.getUniformLocation(waterProg[i], "uSamplerCaustic");
            waterProg[i].samplerReflectUniform = gl.getUniformLocation(waterProg[i], "uSamplerReflect");
            waterProg[i].eyePositionUniform = gl.getUniformLocation(waterProg[i],"uEyePosition");
            waterProg[i].nmlMatrixUniform = gl.getUniformLocation(waterProg[i], "uNmlMatrix");
            waterProg[i].progNumUniform = gl.getUniformLocation(waterProg[i], "uProgNum");
            waterProg[i].sphereCenterUniform = gl.getUniformLocation(waterProg[i], "uSphereCenter");
            waterProg[i].sphereRadiusUniform = gl.getUniformLocation(waterProg[i], "uSphereRadius");
            waterProg[i].causticOnUniform = gl.getUniformLocation(waterProg[i], "uCausticOn");
            waterProg[i].isSphereUniform = gl.getUniformLocation(waterProg[i], "uIsSphere");
            waterProg[i].drawObjReflectUniform = gl.getUniformLocation(waterProg[i], "uDrawObjReflect");
 
        }

        //-----------------------height------------------------------------------------
        heightProg = gl.createProgram();
        gl.attachShader(heightProg, getShader(gl, "interact-vs") );
        gl.attachShader(heightProg, getShader(gl, "interact-height-fs") );
        gl.linkProgram(heightProg);

        if (!gl.getProgramParameter(heightProg, gl.LINK_STATUS)) {
            alert("Could not initialize height shader.");
        }
        gl.useProgram(heightProg);

        heightProg.vertexPositionAttribute = gl.getAttribLocation(heightProg, "aVertexPosition");
        heightProg.samplerWaterUniform = gl.getUniformLocation(heightProg, "uSamplerWater");
        heightProg.centerUniform = gl.getUniformLocation(heightProg,"uCenter");
        heightProg.radiusUniform = gl.getUniformLocation(heightProg,"uRadius");
        heightProg.strengthUniform = gl.getUniformLocation(heightProg,"uStrength");

        
        //-----------------------caustic------------------------------------------------
        causticProg = gl.createProgram();
        gl.attachShader(causticProg, getShader(gl, "caustic-vs") );
        gl.attachShader(causticProg, getShader(gl, "caustic-fs") );
        gl.linkProgram(causticProg);

        if (!gl.getProgramParameter(causticProg, gl.LINK_STATUS)) {
            alert("Could not initialize caustic shader.");
        }
        gl.useProgram(causticProg);

        causticProg.samplerWaterUniform = gl.getUniformLocation(causticProg, "uSamplerWater");
        causticProg.isSphereUniform = gl.getUniformLocation(causticProg, "uIsSphere");
        causticProg.vertexPositionAttribute = gl.getAttribLocation(causticProg, "aVertexPosition");
        causticProg.OESderivativesUniform = gl.getUniformLocation(causticProg,"OES_standard_derivatives");
        causticProg.sphereRadiusUniform = gl.getUniformLocation(causticProg, "uSphereRadius");
        causticProg.sphereCenterUniform = gl.getUniformLocation(causticProg, "uSphereCenter");
        causticProg.lightMatrixUniform = gl.getUniformLocation(causticProg, "uLightMatrix");
        causticProg.lightProjUniform = gl.getUniformLocation(causticProg, "uLightProj");

         //-----------------------normal------------------------------------------------
        normalProg = gl.createProgram();
        gl.attachShader(normalProg, getShader(gl, "interact-vs") );
        gl.attachShader(normalProg, getShader(gl, "interact-normal-fs") );
        gl.linkProgram(normalProg);

        if (!gl.getProgramParameter(normalProg, gl.LINK_STATUS)) {
            alert("Could not initialize normal shader.");
        }
        gl.useProgram(normalProg);

        normalProg.vertexPositionAttribute = gl.getAttribLocation(normalProg, "aVertexPosition");
        normalProg.samplerWaterUniform = gl.getUniformLocation(normalProg, "uSamplerWater");
        normalProg.deltaUniform = gl.getUniformLocation(normalProg,"uDelta");

        //-----------------------simulation-----------------------------------------------
        // Make the animation soft
        simulateProg = gl.createProgram();
        gl.attachShader(simulateProg, getShader(gl, "interact-vs") );
        gl.attachShader(simulateProg, getShader(gl, "interact-simulate-fs") );
        gl.linkProgram(simulateProg);

        if (!gl.getProgramParameter(simulateProg, gl.LINK_STATUS)) {
            alert("Could not initialize simulate shader.");
        }
        gl.useProgram(simulateProg);

        simulateProg.vertexPositionAttribute = gl.getAttribLocation(simulateProg, "aVertexPosition");
        simulateProg.samplerWaterUniform = gl.getUniformLocation(simulateProg, "uSamplerWater");
        simulateProg.deltaUniform = gl.getUniformLocation(simulateProg,"uDelta");

        //---------------------sphere interaction---------------------------------------------------
        for (var i = 0; i < fishCount; i++) {
            setObjectProgAttribute(i);
        }

        //---------------------obj depth map---------------------------------------------------
        depthProg = gl.createProgram();
        gl.attachShader(depthProg, getShader(gl, "depth-vs") );
        gl.attachShader(depthProg, getShader(gl, "depth-fs") );
        gl.linkProgram(depthProg);


        if (!gl.getProgramParameter(depthProg, gl.LINK_STATUS)) {
            alert("Could not initialize depth shader.");
        }
        gl.useProgram(depthProg);

        depthProg.vertexPositionAttribute = gl.getAttribLocation(depthProg, "aVertexPosition");
        depthProg.vertexNormalAttribute = gl.getAttribLocation(depthProg, "aVertexNormal");
        depthProg.pMatrixUniform = gl.getUniformLocation(depthProg, "uPMatrix");
        depthProg.mvMatrixUniform = gl.getUniformLocation(depthProg, "uMVMatrix");
        depthProg.centerUniform = gl.getUniformLocation(depthProg, "uCenter");
        depthProg.modeUniform = gl.getUniformLocation(depthProg, "uMode");


        //---------------------perlin noise for wind------------------------------------------------
        windProg = gl.createProgram();
        gl.attachShader(windProg, getShader(gl, "perlin-vs") );
        gl.attachShader(windProg, getShader(gl, "perlin-fs") );
        gl.linkProgram(windProg);

        if (!gl.getProgramParameter(windProg, gl.LINK_STATUS)) {
            alert("Could not initialize wind shader.");
        }
        gl.useProgram(windProg);

        windProg.vertexPositionAttribute = gl.getAttribLocation(windProg, "aVertexPosition");
        windProg.samplerWaterUniform = gl.getUniformLocation(windProg, "uSamplerWater");
        windProg.samplerPermUniform = gl.getUniformLocation(windProg, "uSamplerPerm");
        windProg.samplerGradUniform = gl.getUniformLocation(windProg, "uSamplerGrad");
        windProg.timeUniform = gl.getUniformLocation(windProg, "uTime");

        //---------------------particle for rain------------------------------------------------
        rainProg = gl.createProgram();
        gl.attachShader(rainProg, getShader(gl, "rain-vs") );
        gl.attachShader(rainProg, getShader(gl, "rain-fs") );
        gl.linkProgram(rainProg);

        if (!gl.getProgramParameter(rainProg, gl.LINK_STATUS)) {
            alert("Could not initialize rain shader.");
        }
        gl.useProgram(rainProg);

        rainProg.vertexPositionAttribute = gl.getAttribLocation(rainProg, "aVertexPosition");
        rainProg.pMatrixUniform = gl.getUniformLocation(rainProg, "uPMatrix");
        rainProg.mvMatrixUniform = gl.getUniformLocation(rainProg, "uMVMatrix");


        //----------------------quad debug shader----------------------------------------------
        quadProg = gl.createProgram();
        gl.attachShader(quadProg, getShader(gl, "quad-vs"));
        gl.attachShader(quadProg, getShader(gl, "quad-fs"));
        gl.linkProgram(quadProg);

        if (!gl.getProgramParameter(quadProg, gl.LINK_STATUS)) {
            alert("Could not initialize quad shader.");
        }
        gl.useProgram(quadProg);

        quadProg.vertexPositionAttribute = gl.getAttribLocation(quadProg, "aVertexPosition");
        quadProg.samplerDepthUniform = gl.getUniformLocation(quadProg, "uSamplerDepth");
        quadProg.textureCoordAttribute = gl.getAttribLocation(quadProg, "aTextureCoord");
        quadProg.modeUniform = gl.getUniformLocation(quadProg, "uMode");
        
        //----------------------god rays----------------------------------------------
        // The light of the gap == the sunlight
        godrayProg = gl.createProgram();
        gl.attachShader(godrayProg, getShader(gl, "godray-vs") );
        gl.attachShader(godrayProg, getShader(gl, "godray-fs") );
        gl.linkProgram(godrayProg);

        if (!gl.getProgramParameter(godrayProg, gl.LINK_STATUS)) {
            alert("Could not initialize godray shader.");
        }
        gl.useProgram(godrayProg);

        godrayProg.vertexPositionAttribute = gl.getAttribLocation(godrayProg, "aVertexPosition");
        godrayProg.textureCoordAttribute = gl.getAttribLocation(godrayProg, "aTexcoord");
        
        godrayProg.mvMatrixUniform = gl.getUniformLocation(godrayProg, "uMVMatrix");
        godrayProg.pMatrixUniform = gl.getUniformLocation(godrayProg, "uPMatrix");
        godrayProg.lightMatrixUniform = gl.getUniformLocation(godrayProg, "uLightMatrix");
        godrayProg.samplerInputUniform = gl.getUniformLocation(godrayProg, "uSamplerInput");
        godrayProg.passUniform = gl.getUniformLocation(godrayProg, "uPass");

        //----------------------obj reflection---------------------------------------------
        reflectProg = gl.createProgram();
        gl.attachShader(reflectProg, getShader(gl, "reflect-vs") );
        gl.attachShader(reflectProg, getShader(gl, "reflect-fs") );
        gl.linkProgram(reflectProg);

        if (!gl.getProgramParameter(reflectProg, gl.LINK_STATUS)) {
            alert("Could not initialize reflect shader.");
        }
        gl.useProgram(reflectProg);

         reflectProg.vertexPositionAttribute = gl.getAttribLocation(reflectProg, "aVertexPosition");
        //reflectProg.vertexNormalAttribute = gl.getAttribLocation(reflectProg, "aVertexNormal");
        reflectProg.mvMatrixUniform = gl.getUniformLocation(reflectProg, "uMVMatrix");
        reflectProg.pMatrixUniform = gl.getUniformLocation(reflectProg, "uPMatrix");
        //--------------------post process------------------------------------------------
        postProg = gl.createProgram();
        gl.attachShader(postProg, getShader(gl, "quad-vs"));
        gl.attachShader(postProg, getShader(gl, "postprocess-fs"));
        gl.linkProgram(postProg);

        if (!gl.getProgramParameter(postProg, gl.LINK_STATUS)) {
            alert("Could not initialize quad shader.");
        }
        gl.useProgram(postProg);

        postProg.vertexPositionAttribute = gl.getAttribLocation(postProg, "aVertexPosition");
        postProg.samplerGodrayUniform = gl.getUniformLocation(postProg, "uSamplerGodray");
        postProg.samplerColorUniform = gl.getUniformLocation(postProg, "uSamplerColor");
        postProg.textureCoordAttribute = gl.getAttribLocation(postProg, "aTextureCoord");
        
        

        // reflectProg.pMatrixUniform = gl.getUniformLocation(reflectProg, "uPMatrix");
        // reflectProg.centerUniform = gl.getUniformLocation(reflectProg, "uCenter");

    }

    function checkCanDrawToTexture(texture){
        framebuffer = framebuffer || gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        var result = gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return result;
    }

    function handleLoadedTexture(texture) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, texture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        //gl.generateMipmap(gl.TEXTURE_2D);
       // gl.bindTexture(gl.TEXTURE_2D, null);
    }

    function initTexture(texture, url) {
        console.log("loading texture: " + url);
        texture.image = new Image();
        texture.image.onload = function () {
            handleLoadedTexture(texture)
        }

        texture.image.src = url;
    }

    function initCustomeTexture( texture, format, filter, type, width, height, data, wrapS, wrapT){ 
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter );

        wrapS = wrapS ||gl.CLAMP_TO_EDGE;
        wrapT = wrapT ||gl.CLAMP_TO_EDGE;
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT );

        data = data||null;
        if(type == gl.FLOAT){
            if(OES_texture_float){
                gl.texImage2D( gl.TEXTURE_2D, 0, format, width, height, 0, format, type, data);
            }
            else{
                alert("OES_texture_float is not enabled.");
            }
        }
        else{
            gl.texImage2D( gl.TEXTURE_2D, 0, format, width, height, 0, format, type, data);
        }
       // gl.bindTexture(gl.TEXTURE_2D, null);
    }

    // back ground texture
    function initSkyBoxTexture() {
        var ct = 0;
        var img = new Array(6);
        var urls = [
    //    "skybox/posx.jpg", "skybox/negx.jpg", 
    //       "skybox/posy.jpg", "skybox/negy.jpg", 
    //       "skybox/posz.jpg", "skybox/negz.jpg"
    //    "skybox/Sky2.jpg","skybox/Sky3.jpg",
    //   "skybox/Sky4.jpg","skybox/Sky5.jpg", 
    //    "skybox/Sky0.jpg","skybox/Sky1.jpg"
        "skybox/skyright.jpg","skybox/skyleft.jpg",
       "skybox/skyup.jpg","skybox/skydown.jpg", 
        "skybox/skyback.jpg","skybox/skyfront.jpg"
        ];
        for (var i = 0; i < 6; i++) {
            img[i] = new Image();
            img[i].onload = function() {
                ct++;
                if (ct == 6) {   //upon finish loading tmp 6 images
                    sky.Texture = gl.createTexture();
                    gl.bindTexture(gl.TEXTURE_CUBE_MAP, sky.Texture);
                    var targets = [
                       gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 
                       gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 
                       gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z ];
                    for (var j = 0; j < 6; j++) {
                      //  console.log("bingding skybox texture: " + targets[j]);
                        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                        gl.texImage2D(targets[j], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img[j]);
                        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    }
                    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                  
                }
            }
           // console.log("loading skybox texture: " + urls[i]);
            img[i].src = urls[i];
        }
    }
  
    function mvPushMatrix() {
        var copy = mat4.create();
        mat4.set(mvMatrix, copy);
        mvMatrixStack.push(copy);
    }

    function mvPopMatrix() {
        if (mvMatrixStack.length == 0) {
            throw "Invalid popMatrix!";
        }
        mvMatrix = mvMatrixStack.pop();
    }


    function setMatrixUniforms(prog) {
        gl.uniformMatrix4fv(prog.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(prog.mvMatrixUniform, false, mvMatrix);
    }


    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }



    function initBuffers(model, primitive) {
        model.VBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, model.VBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(primitive.vertices), gl.STATIC_DRAW);
    
        model.NBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, model.NBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(primitive.normals), gl.STATIC_DRAW);
    
        model.TBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, model.TBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(primitive.texcoords), gl.STATIC_DRAW);
    
        model.IBO = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.IBO);
    
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(primitive.indices), gl.STATIC_DRAW);
        model.IBO.numItems = primitive.numIndices;
    }


//Object initial setting
function initObjs(i){

    // load object file with size ( .obj )
    objRaw[i] = loadObj("objs/object0" + fishes[i] + ".obj",size[i]);

    objRaw[i].addCallback(function () {
        objModel[nowObjectNumber] = new createModel(gl, objRaw[nowObjectNumber]);
        var tmp = {};
        tmp.vertices = [];
        tmp.indices = [];
        tmp.normals = [];
        tmp.texcoords = [];
        for (var i = 0; i < objRaw[nowObjectNumber].numGroups(); i++) {
            for (var j = 0; j < objRaw[nowObjectNumber].vertices(i).length; j++) {
                tmp.vertices.push(objRaw[nowObjectNumber].vertices(i)[j]);
            }
        }

        for (var i = 0; i < objRaw[nowObjectNumber].numGroups(); i++) {
            for (var j = 0; j < objRaw[nowObjectNumber].indices(i).length; j++) {
                tmp.indices.push(objRaw[nowObjectNumber].indices(i)[j]);
            }
        }


        for (var i = 0; i < objRaw[nowObjectNumber].numGroups(); i++) {
            for (var j = 0; j < objRaw[nowObjectNumber].normals(i).length; j++) {
                tmp.normals.push(objRaw[nowObjectNumber].normals(i)[j]);
            }
        }

        for (var i = 0; i < objRaw[nowObjectNumber].numGroups(); i++) {
            for (var j = 0; j < objRaw[nowObjectNumber].texcoords(i).length; j++) {
                tmp.texcoords.push(objRaw[nowObjectNumber].texcoords(i)[j]);
            }
        }
    
        // tmp.numIndices = sum + cubePool.numIndices;
        // tmp.numIndices = tmp.indices.length;
        depthModel[nowObjectNumber] = {};
        initBuffers(depthModel[nowObjectNumber], tmp);



        // console.log(objModel[i].numGroups());
        // console.log("obj indices: " + sum);
        // console.log("depthModel indices: " + depthModel.IBO.numItems);
    });
    objRaw[i].executeCallBackFunc();
    registerAsyncObj(gl, objRaw[i]);

}

function handleMouseDown(event) {
    if( event.button == 2 ) {
        mouseLeftDown = false;
        mouseRightDown = true;
    }
    else {
        mouseLeftDown = true;
        mouseRightDown = false;
        startInteraction(event.clientX, event.clientY); 
    }
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
}

function handleMouseUp(event) {
    mouseLeftDown = false;
    mouseRightDown = false;
}

function handleMouseMove(event) {
    if (!(mouseLeftDown || mouseRightDown)) {
        return;
    }
    var newX = event.clientX;
    var newY = event.clientY;

    var deltaX = newX - lastMouseX;
    var deltaY = newY - lastMouseY;
    
    if( mouseLeftDown ) {
        duringInterction(newX, newY);
        //radius += 0.01 * deltaY;
        //radius = Math.min(Math.max(radius, 2.0), 10.0);
    }
    else {
        azimuth += 0.01 * deltaX;
        elevation += 0.01 * deltaY;
        elevation = Math.min(Math.max(elevation, -Math.PI/2+0.001), Math.PI/2-0.001);
    }
    eye = sphericalToCartesian(radius, azimuth, elevation);
    view = mat4.create();
    mat4.lookAt(eye, center, up, view);

    lastMouseX = newX;
    lastMouseY = newY;
}

function handleMouseWheel(event){
        //console.log("scroll");
    var move = event.wheelDelta/240;
    
    if (move < 0 || pMatrix[14] > -2){
      //  pMatrix = mat4.translate(pMatrix, [0, 0, event.wheelDelta/240]);
    }
    if(fov+move< 90 && fov+move> 25){
        fov += move;
    }
    return false; // Don't scroll the page 
}

function startInteraction(x,y){
    initTracer();
    var ray = vec3.create();
    ray = rayEyeToPixel(x,y);

    for (var i = 0; i < fishCount; i++) {
        var hit = vec3.create();
        hit = rayIntersectSphere(tracer.eye, ray, sphere[i].center, sphere[i].radius);
        if (hit != null) {   // sphere[i] interaction
            preHit[i] = vec3.create(0.0);
            preHit[i] = hit;
            viewportNormal = rayEyeToPixel(gl.viewportWidth / 2.0, gl.viewportHeight / 2.0);
            vec3.negate(viewportNormal);
            mode = i+1;
            clickObject = i;
            console.log("--------------hit sphere[" + i + "] at " + vec3.str(preHit[i]));
            // console.log("--------------viewportNormal="+vec3.str(viewportNormal));
        }
        else {   // mouse directioin interaction
            var scale = -tracer.eye[1] / ray[1];
            // move in the direction of ray, until gets the 'y=waterHeight'
			// plane
            var point = vec3.create([tracer.eye[0] + ray[0] * scale, tracer.eye[1] + ray[1] * scale, tracer.eye[2] + ray[2] * scale]);
            if (Math.abs(point[0]) < 1 && Math.abs(point[2]) < 1) {
                drawHeight(point[0], point[2]);
                // if (mode == 0)
                //     mode = 0;
                mode = 0; // mouse 
            }
        }
    }
}

function duringInterction(x,y){

    var ray = vec3.create();
    ray = rayEyeToPixel(x,y);
    if(mode == 0){   //direct mouse interaction
        var scale = -tracer.eye[1] / ray[1];
        var point = vec3.create([tracer.eye[0] + ray[0]*scale, tracer.eye[1] + ray[1]*scale, tracer.eye[2] + ray[2]*scale] );
   
        if (Math.abs(point[0]) < 1 && Math.abs(point[2]) < 1) {
          drawHeight(point[0],point[2]);
        }
    }
    //var hit = rayIntersectSphere(tracer.eye, ray, sphere.center, sphere.radius);
    //if(hit!= null){   //sphere interaction, move sphere around
    if (flag == 1) {
        for (var i = 0; i < fishCount; i++) {
            if (mode == i + 1) {  // sphere[i] interaction, move sphere[i] around
                var theEye = vec3.create(tracer.eye);
                var preRay = vec3.create(preHit[i]); // Change to array.
                var nxtRay = vec3.create(ray);
    
                vec3.subtract(preRay, theEye);   // preRay = preHit[i] - eye
                var t1 = vec3.dot(viewportNormal, preRay);
                var t2 = vec3.dot(viewportNormal, nxtRay);
                var t = t1 / t2;
                vec3.scale(nxtRay, t);
                // console.log("-----------------------");
                // console.log("pre ray: " + vec3.str(preRay));
                // console.log("nxt ray: " + vec3.str(nxtRay));
    
                var nxtHit = vec3.create();
                nxtHit = vec3.add(theEye, nxtRay);
                var offsetHit = vec3.create(nxtHit);
                vec3.subtract(offsetHit, preHit[i]);   // offsetHit = nxtHit -
                // preHit[i]
    
                // console.log("pre hit: " + vec3.str(preHit[i]));
                // console.log("nxt hit: " + vec3.str(nxtHit));
                // console.log("hit offset: " + vec3.str(offsetHit));
    
                if (vec3.length(offsetHit) > 0.0) {   // change location
                    vec3.add(sphere[i].center, offsetHit);
                    // make sure the sphere[i] is in the boundary of pool
                    sphere[i].center[0] = Math.max(sphere[i].radius - 1.0, Math.min(1.0 - sphere[i].radius, sphere[i].center[0]));
                    if (isSphere == 1) {
                        sphere[i].center[1] = Math.max(sphere[i].radius - 0.65 - 0.3, Math.min(10, sphere[i].center[1]));
                    } else {
                        sphere[i].center[1] = Math.max(sphere[i].radius - 0.65 - 0.3 - 0.1, Math.min(10, sphere[i].center[1]));
                    }
                    sphere[i].center[2] = Math.max(sphere[i].radius - 1.0, Math.min(1.0 - sphere[i].radius, sphere[i].center[2]));
                    // console.log("drag center: " + vec3.str(sphere[i].center));
                }
    
                preHit[i] = nxtHit;
            }
        }
    }

}

function drawScene() {


    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    mat4.perspective(fov, gl.viewportWidth / gl.viewportHeight, 1.0, 40.0, pMatrix);

    mat4.identity(mvMatrix);
    mat4.multiply(mvMatrix,view);

    mat4.inverse(mvMatrix,nmlMatrix);
    mat4.transpose(nmlMatrix,nmlMatrix);
    
    if(parameters.Caustic == true) u_CausticOnLocation = 1.0;
    else u_CausticOnLocation = 0.0;
    
    if(parameters.Object == "sphere") isSphere = 1;
    else isSphere = 0;
    if(isSphere == 1){
        // sphereRadius = parameters.Sphere_Radius;
        // sphereObj = createSphere(sphereRadius, 12, 12);
        // initBuffers(sphere, sphereObj);
        // sphere.radius = sphereObj.radius;

        //initObjs();
    }else{
        // Change to for loop.
        for (var i = 0; i < fishCount; i++) {
            sphere[i].radius = 0.23;
        }
    }

    if(parameters.Pool_Pattern == "white brick" && currentPoolPattern != "white brick"){
        initTexture(pool.Texture, "tile/cube5.jpg");
        currentPoolPattern = "white brick";
    }
    if(parameters.Pool_Pattern == "marble" && currentPoolPattern != "marble") {
        // initTexture(pool.Texture, "tile/tile3.jpg");
        // initTexture(pool.Texture, "going1.png");
        initTexture(pool.Texture, "tile/cube2.jpg");
        currentPoolPattern = "marble";
    }
    if(parameters.Pool_Pattern == "blue tile" && currentPoolPattern != "blue tile"){
        initTexture(pool.Texture, "tile/tile4.jpg");
        currentPoolPattern = "blue tile";
    }
    if(parameters.Pool_Pattern == "golden tile" && currentPoolPattern != "golden tile"){
        initTexture(pool.Texture, "tile/tile5.jpg");
        currentPoolPattern = "golden tile";
    }


    var lightView = mat4.lookAt(lightInvDir, vec3.create([0,0,0]), vec3.create([0,1,0]));  //from the point of view of the light
    lightProj = mat4.ortho(-2,2,-2,2,-4,4);  //axis-aligned box (-10,10),(-10,10),(-10,20) on the X,Y and Z axes
    mat4.identity(lightMatrix);
    mat4.multiply(lightMatrix, lightView);
    drawDepth(colorTexture, depthTexture[clickObject], lightMatrix, lightProj, depthModel[clickObject], false, 0,clickObject);   // depth
    // from
    // light
    initTracer();
    var ray = vec3.create();
    var cam = vec3.create(tracer.eye);
    // cam.z = - cam.z;
        var inverseCenter = vec3.create(sphere[clickObject].center);
        if (sphere[clickObject].center[1] > 0.0) {
            inverseCenter[1] = -inverseCenter[1];
        }
        ray = vec3.subtract(inverseCenter, cam);
        vec3.normalize(ray);
        var scale = -cam[1] / ray[1];
        var point = vec3.create([cam[0] + ray[0] * scale, cam[1] + ray[1] * scale, cam[2] + ray[2] * scale]);
   
    // var point = vec3.create([sphere[i].center[0], 0,
    // sphere[i].center[2]]);
    var upVector = vec3.create();
    var rightVector = vec3.create();
    forwardVector = vec3.subtract(vec3.create([0, 0, 0]), cam);
    rightVector = vec3.cross(forwardVector, up);
    reflectProj = mat4.ortho(-2, 2, -2, 2, -4, 4);
	
    // var center = vec3.create(sphere.center);
    // forwardVector = vec3.subtract(center, point); 

    // upVector = vec3.cross(rightVector,forwardVector);
    upVector = vec3.subtract(cam, point);
    vec3.normalize(upVector);
    // if (Math.abs(point[0]) < 1 && Math.abs(point[2]) < 1) { //water plane
    var reflectView = mat4.lookAt(point, sphere[clickObject].center, upVector);   // [eye,center, up]
    mat4.identity(reflectModelView);
    mat4.multiply(reflectModelView, reflectView);
    	drawDepth(colorTexture3, depthTexture3, reflectModelView, reflectProj, depthModel[clickObject], true, 1, clickObject); 	

    drawDepth(colorTexture2, depthTexture2, mvMatrix, pMatrix, depthModel[clickObject], false , 0 ,clickObject);   // depth

    
    gl.frontFace(gl.CCW);   // define front face
    gl.cullFace(gl.BACK);
      
    // Draw pool, back ground, water 
    drawPool(clickObject);
    drawSkyBox();
    drawWater();
    
    // Draw objects as mush as fish count
    for (var i = 0; i < fishCount; i++) {
        drawObj(objModel[i], i);
    }
    
    drawNormal();
    
    drawSimulation();
    drawSimulation(); 
    
    for (var i = 0; i < fishCount; i++) {
        drawInteraction(i); // Interaction of object
        sphere[i].oldcenter = vec3.create(sphere[i].center);
    }
    drawCaustic();

    // drawQuad(finalrenderTexture);
    if (parameters.Wind == true) {
        drawWind();
    }
	
    // Animation event of rain
    if (parameters.Rain == true) {
        if (rainCounter % 30 == 0) {
            var num = Math.random() * 15 + 5;  // [5, 20]
            for (var i = 0; i < num; i++) {
                var x = Math.random() * 2 - 1;
                var y = Math.random() * 2 - 1;
                var radius = Math.random() * 0.02 + 0.01; // [0.01,0.03]
                var strength = Math.random() * 0.04 - 0.01;  // [-0.01, 0.04]
                drawHeight(x, y, radius, strength);
            }
        }
        rainCounter++;
        // var viewProjection = g_math.mulMatrixMatrix4(g_view, g_projection);
        // var viewInverse = g_math.inverse4(g_view);
        // //g_particleSystem.draw(viewProjection, g_world, viewInverse);
        // drawRain();
       
    }
    else{
        rainCounter = 0;
       
         
    }
    
    if(parameters.Depth_From_Light == true){
       // drawQuad(depthTexture,0)
       drawQuad(finaldepthTexture, 0);
       // drawQuad(godrayTextureA, 0);   //this is the debug draw ctmp for depth texture
       // drawQuad(godrayTextureA, 1);   //this is the debug draw ctmp for depth texture
        //drawGodrayPass1();
    }
    else if(parameters.Depth_From_Camera == true){
        drawQuad(godrayTextureB, 1);
        
    }
    if(parameters.God_rays == true){
        drawPost();
       

        drawQuad(postrenderTexture, 1);
    }
}

function drawQuad(texture, mode){
     gl.useProgram(quadProg);

    gl.bindBuffer(gl.ARRAY_BUFFER, quad.VBO);
    gl.vertexAttribPointer(quadProg.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(quadProg.vertexPositionAttribute);

    gl.bindBuffer(gl.ARRAY_BUFFER, quad.TBO);
    gl.vertexAttribPointer(quadProg.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(quadProg.textureCoordAttribute);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(quadProg.samplerDepthUniform, 0);

    gl.uniform1i(quadProg.modeUniform, mode);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quad.IBO);
    gl.drawElements(gl.TRIANGLES, quad.IBO.numItems, gl.UNSIGNED_SHORT, 0);

    gl.disableVertexAttribArray(quadProg.vertexPositionAttribute);
    gl.disableVertexAttribArray(quadProg.textureCoordAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

function drawPool(clickObject) {

    if (parameters.God_rays == true) initFrameBuffer(finalrenderTexture, null, gl.viewportWidth, gl.viewportHeight);
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);
    gl.useProgram(poolProg);

    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);   // define front face
    gl.cullFace(gl.FRONT);   // cull front facing faces

    gl.bindBuffer(gl.ARRAY_BUFFER, pool.VBO);
    gl.vertexAttribPointer(poolProg.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(poolProg.vertexPositionAttribute);

    gl.bindBuffer(gl.ARRAY_BUFFER, pool.NBO);
    gl.vertexAttribPointer(poolProg.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(poolProg.vertexNormalAttribute);

    gl.bindBuffer(gl.ARRAY_BUFFER, pool.TBO);
    gl.vertexAttribPointer(poolProg.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(poolProg.textureCoordAttribute);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, pool.Texture);
    gl.uniform1i(poolProg.samplerTileUniform, 0);
    
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, water.TextureC);
    gl.uniform1i(poolProg.samplerCausticUniform, 1);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, water.TextureA);
    gl.uniform1i(poolProg.samplerWaterUniform, 2);


    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, depthTexture[clickObject]);
    gl.uniform1i(poolProg.samplerDepthUniform, 3);

    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, godrayTextureA);
    gl.uniform1i(poolProg.samplerGodrayUniform, 4);



    setMatrixUniforms(poolProg);
    gl.uniformMatrix4fv(poolProg.nmlMatrixUniform, false, nmlMatrix);
    gl.uniformMatrix4fv(poolProg.lightMatrixUniform, false, lightMatrix);
    gl.uniformMatrix4fv(poolProg.lightProjUniform, false, lightProj);

    
    gl.uniform1f(poolProg.sphereRadiusUniform, sphere[clickObject].radius);
    gl.uniform3fv(poolProg.sphereCenterUniform, sphere[clickObject].center);
    gl.uniform1f(poolProg.causticOnUniform, u_CausticOnLocation);
    gl.uniform1i(poolProg.isSphereUniform, isSphere);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pool.IBO);
    gl.drawElements(gl.TRIANGLES, pool.IBO.numItems, gl.UNSIGNED_SHORT, 0);

    gl.disable(gl.CULL_FACE);
    gl.disableVertexAttribArray(poolProg.vertexPositionAttribute);

    // gl.disableVertexAttribArray(poolProg.textureCoordAttribute);
    gl.disableVertexAttribArray(poolProg.vertexNormalAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function drawSkyBox() {
    if(parameters.God_rays == true) initFrameBuffer(finalrenderTexture, null, gl.viewportWidth, gl.viewportHeight);
    
    if (sky.Texture){
        gl.useProgram(skyProg);
        // console.log("drawing sky");

        gl.bindBuffer(gl.ARRAY_BUFFER, sky.VBO);
        gl.vertexAttribPointer(skyProg.vertexPositionAttribute , 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(skyProg.vertexPositionAttribute );

        setMatrixUniforms(skyProg);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, sky.Texture);
        gl.uniform1i(skyProg.samplerSkyUniform, 1);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sky.IBO);
        gl.drawElements(gl.TRIANGLES, sky.IBO.numItems, gl.UNSIGNED_SHORT, 0);

        gl.disableVertexAttribArray(skyProg.vertexPositionAttribute);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }
    
}


function drawObj(model, i) {

    if (parameters.God_rays == true) initFrameBuffer(finalrenderTexture, finaldepthTexture, gl.viewportWidth, gl.viewportHeight);

    gl.useProgram(objProg[i]);
    // gl.clear(gl.DEPTH_BUFFER_BIT);
    // gl.enable(gl.DEPTH_TEST);
    // gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);   // define front face
    gl.cullFace(gl.BACK);
    if (model == sphere[i]) {


    }
    else {
        // console.log("drawing obj instead of sphere[i]");
        for (var k = 0; k < model.numGroups(); k++) {
            // console.log("model VBO: " +model.VBO(i));
            gl.bindBuffer(gl.ARRAY_BUFFER, model.VBO(k)); // Vertex Buffer Objects, VBO
            gl.vertexAttribPointer(objProg[i].vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(objProg[i].vertexPositionAttribute);

            gl.bindBuffer(gl.ARRAY_BUFFER, model.NBO(k));
            gl.vertexAttribPointer(objProg[i].vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(objProg[i].vertexNormalAttribute);

            gl.bindBuffer(gl.ARRAY_BUFFER, model.TBO(k)); // Texture Buffer (TBO)
            gl.vertexAttribPointer(objProg[i].textureCoordAttribute, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(objProg[i].textureCoordAttribute);

            setMatrixUniforms(objProg[i]);
            // console.log("center is "+ vec3.str(model.center));
            gl.uniform3fv(objProg[i].centerUniform, sphere[i].center);
            // gl.uniform1f(objProg[i].RadiusUniform, model.radius);
            gl.uniform1i(objProg[i].isSphereUniform, 0);


            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, water.TextureA);
            gl.uniform1i(objProg[i].samplerWaterUniform, 2);

            gl.activeTexture(gl.TEXTURE3);
            gl.bindTexture(gl.TEXTURE_2D, water.TextureC);
            gl.uniform1i(objProg[i].samplerCausticUniform, 3);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, objTexture[i]);
            gl.uniform1i(objProg[i].samplerTextureUniform, 0);

            gl.uniform1f(objProg[i].causticOnUniform, u_CausticOnLocation);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.IBO(k));
            gl.drawElements(gl.TRIANGLES, model.numIndices(k), gl.UNSIGNED_SHORT, 0);
        }

    }

    gl.disableVertexAttribArray(objProg[i].vertexPositionAttribute);
    gl.disableVertexAttribArray(objProg[i].vertexNormalAttribute);
    gl.disableVertexAttribArray(objProg[i].textureCoordAttribute);
    // gl.bindBuffer(gl.ARRAY_BUFFER, null);
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

function drawPost(){
    initFrameBuffer(postrenderTexture, null, gl.viewportWidth, gl.viewportHeight);
    gl.useProgram(postProg);
    
     gl.bindBuffer(gl.ARRAY_BUFFER, quad.VBO);
    gl.vertexAttribPointer(postProg.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(postProg.vertexPositionAttribute);

    gl.bindBuffer(gl.ARRAY_BUFFER, quad.TBO);
    gl.vertexAttribPointer(postProg.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(postProg.textureCoordAttribute);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, godrayTextureA);
    gl.uniform1i(postProg.samplerGodrayUniform, 0);
    
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, finalrenderTexture);
    gl.uniform1i(postProg.samplerColorUniform, 1);


    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quad.IBO);
    gl.drawElements(gl.TRIANGLES, quad.IBO.numItems, gl.UNSIGNED_SHORT, 0);

    gl.disableVertexAttribArray(postProg.vertexPositionAttribute);
    gl.disableVertexAttribArray(postProg.textureCoordAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}
function drawWater(){
        if(parameters.God_rays == true) initFrameBuffer(finalrenderTexture, finaldepthTexture, gl.viewportWidth, gl.viewportHeight);
        gl.enable(gl.CULL_FACE);
         gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LESS);
        // gl.clear(gl.DEPTH_BUFFER_BIT);
        // gl.enable(gl.DEPTH_TEST);
        for(var i=0 ;i<2; i++){  
              
            gl.cullFace(i ? gl.BACK : gl.FRONT);

            gl.useProgram(waterProg[i]);
            gl.bindBuffer(gl.ARRAY_BUFFER, water.VBO);
            gl.vertexAttribPointer(waterProg[i].vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(waterProg[i].vertexPositionAttribute);

            gl.bindBuffer(gl.ARRAY_BUFFER, water.NBO);
            gl.vertexAttribPointer(waterProg[i].vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(waterProg[i].vertexNormalAttribute);

            setMatrixUniforms(waterProg[i]);
            gl.uniformMatrix4fv(waterProg[i].rmvMatrixUniform, false,  reflectModelView);
            gl.uniformMatrix4fv(waterProg[i].rpMatrixUniform, false, reflectProj);
            gl.uniformMatrix4fv(waterProg[i].nmlMatrixUniform, false, nmlMatrix);
            gl.uniform1i(waterProg[i].progNumUniform, i);

            gl.uniform3fv(waterProg[i].sphereCenterUniform, sphere[0].center);
            
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, sky.Texture);
            gl.uniform1i(waterProg[i].samplerSkyUniform, 1);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, pool.Texture);
            gl.uniform1i(waterProg[i].samplerTileUniform,0);

    
            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, water.TextureA);
            gl.uniform1i(waterProg[i].samplerWaterUniform,2);
            
            gl.activeTexture(gl.TEXTURE3);
            gl.bindTexture(gl.TEXTURE_2D, water.TextureC);
            gl.uniform1i(waterProg[i].samplerCausticUniform,3);

            gl.activeTexture(gl.TEXTURE4);
            gl.bindTexture(gl.TEXTURE_2D, colorTexture3);
            gl.uniform1i(waterProg[i].samplerReflectUniform,4);
            
            gl.uniform1f(waterProg[i].causticOnUniform, u_CausticOnLocation);
            gl.uniform1i(waterProg[i].isSphereUniform, isSphere);
            if(parameters.Draw_Obj_Reflection  == true){
                 gl.uniform1i(waterProg[i].drawObjReflectUniform, 1);
            }else{
                 gl.uniform1i(waterProg[i].drawObjReflectUniform, 0);
            }
           

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, water.IBO);
            gl.drawElements(gl.TRIANGLES, water.IBO.numItems, gl.UNSIGNED_SHORT, 0);

            gl.uniform3fv(waterProg[i].eyePositionUniform, eye);

            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null); 
       
        }
        gl.disable(gl.CULL_FACE);
}

function drawHeight(x,y, radius, strength){   //TextureA as input, TextureB as output

        x = x || 0;
        y = y || 0;
        radius = radius||0.03;
        strength = strength||0.01;
        
        initFrameBuffer(water.TextureB, null, textureSize, textureSize);
        //resize viewport
        gl.viewport(0, 0, textureSize, textureSize);

        //-------------------start rendering to texture--------------------------------------
        gl.useProgram(heightProg);

        gl.bindBuffer(gl.ARRAY_BUFFER, water.VBO);
        gl.vertexAttribPointer(heightProg.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(heightProg.vertexPositionAttribute);

      //  setMatrixUniforms(heightProg);
        gl.uniform2f(heightProg.centerUniform, x, y);
        gl.uniform1f(heightProg.radiusUniform, radius);
        gl.uniform1f(heightProg.strengthUniform, strength);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, water.TextureA);
        gl.uniform1i(heightProg.samplerWaterUniform,0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, water.IBO);
        gl.drawElements(gl.TRIANGLES, water.IBO.numItems, gl.UNSIGNED_SHORT, 0);
     

        //-------------- after rendering---------------------------------------------------
        gl.disableVertexAttribArray(heightProg.vertexPositionAttribute);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        // reset viewport
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

        //swap TextureA  & TextureB 
        var tmp = water.TextureA;
        water.TextureA = water.TextureB;
        water.TextureB = tmp;

}


function drawCaustic() {

    initFrameBuffer(water.TextureC, null, textureSize2, textureSize2);

    gl.viewport(0, 0, textureSize2, textureSize2);
    gl.useProgram(causticProg);

    gl.bindBuffer(gl.ARRAY_BUFFER, water.VBO);
    gl.vertexAttribPointer(causticProg.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(causticProg.vertexPositionAttribute);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, water.TextureA);
    gl.uniform1i(causticProg.samplerWaterUniform, 0);

    gl.uniform1i(causticProg.OESderivativesUniform, OES_standard_derivatives);
    gl.uniform1i(causticProg.isSphereUniform, isSphere);
    gl.uniform1f(causticProg.sphereRadiusUniform, sphere[0].radius);
    gl.uniform3fv(causticProg.sphereCenterUniform, sphere[0].center);
    gl.uniformMatrix4fv(causticProg.lightMatrixUniform, false, lightMatrix);
    gl.uniformMatrix4fv(causticProg.lightProjUniform, false, lightProj);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, water.IBO);
    gl.drawElements(gl.TRIANGLES, water.IBO.numItems, gl.UNSIGNED_SHORT, 0);

    gl.disableVertexAttribArray(causticProg.vertexPositionAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    // reset viewport
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
}

function drawNormal() {
    initFrameBuffer(water.TextureB, null, textureSize, textureSize);
    // resize viewport
    gl.viewport(0, 0, textureSize, textureSize);

    // -------------------start rendering to
    // texture--------------------------------------
    gl.useProgram(normalProg);

    gl.bindBuffer(gl.ARRAY_BUFFER, water.VBO);
    gl.vertexAttribPointer(normalProg.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalProg.vertexPositionAttribute);

    gl.uniform2f(normalProg.deltaUniform, 1 / textureSize, 1 / textureSize);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, water.TextureA);
    gl.uniform1i(normalProg.samplerWaterUniform, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, water.IBO);
    gl.drawElements(gl.TRIANGLES, water.IBO.numItems, gl.UNSIGNED_SHORT, 0);

    // -------------- after
    // rendering---------------------------------------------------
    gl.disableVertexAttribArray(normalProg.vertexPositionAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    // reset viewport
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

    // swap TextureA & TextureB
    var tmp = water.TextureA;
    water.TextureA = water.TextureB;
    water.TextureB = tmp;

}

function drawSimulation(){

        initFrameBuffer(water.TextureB, null, textureSize, textureSize);
        //resize viewport
        gl.viewport(0, 0, textureSize, textureSize);

        //-------------------start rendering to texture--------------------------------------
        gl.useProgram(simulateProg);

        gl.bindBuffer(gl.ARRAY_BUFFER, water.VBO);
        gl.vertexAttribPointer(simulateProg.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(simulateProg.vertexPositionAttribute);

        gl.uniform2f(simulateProg.deltaUniform, 1/textureSize, 1/textureSize);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, water.TextureA);
        gl.uniform1i(simulateProg.samplerWaterUniform,0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, water.IBO);
        gl.drawElements(gl.TRIANGLES, water.IBO.numItems, gl.UNSIGNED_SHORT, 0);

        //-------------- after rendering---------------------------------------------------
        gl.disableVertexAttribArray(simulateProg.vertexPositionAttribute);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        // reset viewport
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

        //swap TextureA  & TextureB 
        var tmp = water.TextureA;
        water.TextureA = water.TextureB;
        water.TextureB = tmp;


}

function drawInteraction(i) {

    initFrameBuffer(water.TextureB, null, textureSize, textureSize);
    // resize viewport
    gl.viewport(0, 0, textureSize, textureSize);

    // -------------------start rendering to
    // texture--------------------------------------
    gl.useProgram(objectProg[i]);

    gl.bindBuffer(gl.ARRAY_BUFFER, water.VBO);
    gl.vertexAttribPointer(objectProg[i].vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(objectProg[i].vertexPositionAttribute);

    // console.log("old center: "+ vec3.str(sphere[i].oldcenter));
    // console.log("new center: "+ vec3.str(sphere[i].center));
    gl.uniform3fv(objectProg[i].newCenterUniform, sphere[i].center);
    gl.uniform3fv(objectProg[i].oldCenterUniform, sphere[i].oldcenter);
    gl.uniform1f(objectProg[i].radiusUniform, sphere[i].radius);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, water.TextureA);
    gl.uniform1i(objectProg[i].samplerWaterUniform, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, water.IBO);
    gl.drawElements(gl.TRIANGLES, water.IBO.numItems, gl.UNSIGNED_SHORT, 0);

    // -------------- after
    // rendering---------------------------------------------------
    gl.disableVertexAttribArray(objectProg[i].vertexPositionAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    // reset viewport
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

    // swap TextureA & TextureB
    var tmp = water.TextureA;
    water.TextureA = water.TextureB;
    water.TextureB = tmp;


}

function drawDepth(colTexture, depTexture, modelView, proj, model, renderColor, mode, clickObject) {   // draw
    // depth
    // from
    // light
    // source
    mode = mode || 0;
    initFrameBuffer(colTexture, depTexture, gl.viewportWidth, gl.viewportHeight);

    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.colorMask(renderColor, renderColor, renderColor, renderColor);  // disable
    // writing
    // to
    // color
    gl.useProgram(depthProg);

    gl.uniformMatrix4fv(depthProg.pMatrixUniform, false, proj);
    gl.uniformMatrix4fv(depthProg.mvMatrixUniform, false, modelView);


    gl.bindBuffer(gl.ARRAY_BUFFER, model.VBO);
    gl.vertexAttribPointer(depthProg.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(depthProg.vertexPositionAttribute);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.NBO);
    gl.vertexAttribPointer(depthProg.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(depthProg.vertexNormalAttribute);

    gl.uniform3fv(depthProg.centerUniform, sphere[clickObject].center);
    gl.uniform1i(depthProg.modeUniform, mode);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.IBO);
    gl.drawElements(gl.TRIANGLES, model.IBO.numItems, gl.UNSIGNED_SHORT, 0);


    // -------------- after
    // rendering---------------------------------------------------
    gl.disableVertexAttribArray(depthProg.vertexPositionAttribute);
    gl.disableVertexAttribArray(depthProg.vertexNormalAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.colorMask(true, true, true, true);

    // reset viewport
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // gl.disable(gl.DEPTH_TEST);

    // gl.disable(gl.DEPTH_TEST);


}

function drawWind(){

        initFrameBuffer(water.TextureB,null, textureSize, textureSize);
        //resize viewport
        gl.viewport(0, 0, textureSize, textureSize);

        //-------------------start rendering to texture--------------------------------------
        gl.useProgram(windProg);

        gl.bindBuffer(gl.ARRAY_BUFFER, water.VBO);
        gl.vertexAttribPointer(windProg.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(windProg.vertexPositionAttribute);

      //  setMatrixUniforms((windProg);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, water.TextureA);
        gl.uniform1i(windProg.samplerWaterUniform,0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, permTexture);
        gl.uniform1i(windProg.samplerPermUniform,1);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, gradTexture);
        gl.uniform1i(windProg.samplerGradUniform,2);

        accumTime += 0.08;
        //console.log("time: " + accumTime);
        gl.uniform1f(windProg.timeUniform, accumTime);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, water.IBO);
        gl.drawElements(gl.TRIANGLES, water.IBO.numItems, gl.UNSIGNED_SHORT, 0);
     

        //-------------- after rendering---------------------------------------------------
        gl.disableVertexAttribArray(windProg.vertexPositionAttribute);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        // reset viewport
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

        //swap TextureA  & TextureB 
        var tmp = water.TextureA;
        water.TextureA = water.TextureB;
        water.TextureB = tmp;

}

function drawGodrayPass1(){
    initFrameBuffer(godrayTextureA, null, gl.viewportWidth, gl.viewportHeight);

    //gl.viewport(0, 0, textureSize1, textureSize1);
    gl.useProgram(godrayProg);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, quad.VBO);
    gl.vertexAttribPointer(godrayProg.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(godrayProg.vertexPositionAttribute);
    //godrayProg.vertexPositionAttribute = gl.getAttribLocation(godrayProg, "aTexcoord");
    gl.bindBuffer(gl.ARRAY_BUFFER, quad.TBO);
    gl.vertexAttribPointer(godrayProg.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(godrayProg.textureCoordAttribute);
    
    setMatrixUniforms(godrayProg);
    gl.uniformMatrix4fv(godrayProg.pMatrixUniform, false, lightProj);
    gl.uniformMatrix4fv(godrayProg.lightMatrixUniform, false, lightMatrix);    //model view matrix is from light

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, depthTexture2);
    gl.uniform1i(godrayProg.samplerInputUniform, 0);
    
    gl.uniform1f(godrayProg.passUniform, 1.0);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quad.IBO);
    gl.drawElements(gl.TRIANGLES, quad.IBO.numItems, gl.UNSIGNED_SHORT, 0);
    
    gl.disableVertexAttribArray(godrayProg.vertexPositionAttribute);
    gl.disableVertexAttribArray(godrayProg.textureCoordAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

   // reset viewport
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
   //gl.bindRenderbuffer(gl.RENDERBUFFER, null);
   //gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
}
function drawGodrayPass2(){
    initFrameBuffer(godrayTextureB, null, gl.viewportWidth, gl.viewportHeight);

    gl.useProgram(godrayProg);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, quad.VBO);
    gl.vertexAttribPointer(godrayProg.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(godrayProg.vertexPositionAttribute);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, quad.TBO);
    gl.vertexAttribPointer(godrayProg.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(godrayProg.textureCoordAttribute);
    
    setMatrixUniforms(godrayProg);
    gl.uniformMatrix4fv(godrayProg.pMatrixUniform, false, lightProj);
    gl.uniformMatrix4fv(godrayProg.lightMatrixUniform, false, lightMatrix);    //model view matrix is from light

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, godrayTextureA);
    gl.uniform1i(godrayProg.samplerInputUniform, 0);
    
    gl.uniform1f(godrayProg.passUniform, 2.0);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quad.IBO);
    gl.drawElements(gl.TRIANGLES, quad.IBO.numItems, gl.UNSIGNED_SHORT, 0);
    
    gl.disableVertexAttribArray(godrayProg.vertexPositionAttribute);
    gl.disableVertexAttribArray(godrayProg.textureCoordAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

   // reset viewport
   gl.bindFramebuffer(gl.FRAMEBUFFER, null);
   //gl.bindRenderbuffer(gl.RENDERBUFFER, null);
   //gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
}
function drawGodrayPass3(){
    initFrameBuffer(godrayTextureA,null, gl.viewportWidth, gl.viewportHeight);

    
    gl.useProgram(godrayProg);
    
    gl.bindBuffer(gl.ARRAY_BUFFER,quad.VBO);
    gl.vertexAttribPointer(godrayProg.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(godrayProg.vertexPositionAttribute);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, quad.TBO);
    gl.vertexAttribPointer(godrayProg.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(godrayProg.textureCoordAttribute);
    
    setMatrixUniforms(godrayProg);
    gl.uniformMatrix4fv(godrayProg.pMatrixUniform, false, lightProj);
    gl.uniformMatrix4fv(godrayProg.lightMatrixUniform, false, lightMatrix);    //model view matrix is from light

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, godrayTextureB);
    gl.uniform1i(godrayProg.samplerInputUniform, 0);
    
    gl.uniform1f(godrayProg.passUniform, 3.0);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quad.IBO);
    gl.drawElements(gl.TRIANGLES, quad.IBO.numItems, gl.UNSIGNED_SHORT, 0);
    
    gl.disableVertexAttribArray(godrayProg.vertexPositionAttribute);
    gl.disableVertexAttribArray(godrayProg.textureCoordAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

   // reset viewport
   gl.bindFramebuffer(gl.FRAMEBUFFER, null);
   //gl.bindRenderbuffer(gl.RENDERBUFFER, null);
   //gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
}

function drawReflect(model){
   // console.log("drawing reflection");
    initFrameBuffer(reflectTexture, null, textureSize, textureSize);
   // gl.viewport(0, 0, textureSize, textureSize);
    gl.useProgram(godrayProg);
   // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.useProgram(reflectProg);

    for(var i = 0; i < model.numGroups(); i++) {
        gl.bindBuffer(gl.ARRAY_BUFFER, model.VBO(i));
        gl.vertexAttribPointer(reflectProg.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(reflectProg.vertexPositionAttribute);

        gl.bindBuffer(gl.ARRAY_BUFFER, model.NBO(i));
        gl.vertexAttribPointer(reflectProg.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(reflectProg.vertexNormalAttribute);

        setMatrixUniforms(reflectProg);
        gl.uniform3fv(reflectProg.centerUniform, sphere.center);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,model.IBO(i));
        gl.drawElements(gl.TRIANGLES, model.numIndices(i), gl.UNSIGNED_SHORT, 0);
    }

    gl.disableVertexAttribArray(reflectProg.vertexPositionAttribute);
    gl.disableVertexAttribArray(reflectProg.vertexNormalAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    // reset viewport
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
   // gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    //gl.disable(gl.DEPTH_TEST);

}

function pseudoRandom() {
    var g_randSeed = 0;
    var g_randRange = Math.pow(2, 32);
    return (g_randSeed = (134775813 * g_randSeed + 1) % g_randRange) /
            g_randRange;
}


function initFrameBuffer(coltexture, deptexture, width, height){   // rendering to a texture
    framebuffer = framebuffer || gl.createFramebuffer();
    renderbuffer = renderbuffer || gl.createRenderbuffer();

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);

    framebuffer.width = width;
    framebuffer.height = height;

    if (width!= renderbuffer.width ||height!= renderbuffer.height) {
      renderbuffer.width = width;
      renderbuffer.height = height;
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    }
    
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, coltexture, 0);
     gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, deptexture, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
      alert("Color Framebuffer is not working.");
    }

}


function registerAsyncObj( gl, asyncObj ){
    if( !gl.asyncObjArray ){
        gl.asyncObjArray = [];
    }
    gl.asyncObjArray[gl.asyncObjArray.length] = asyncObj;
}

function check(){
    var i;
    var n;
    n = gl.asyncObjArray.length;
    //check if resources are ready, one by one
    for( i = 0; i < gl.asyncObjArray.length; ++i ){
        if( gl.asyncObjArray[i].isReady() ){
            //Run object's registered ctmpback functions
            nowObjectNumber = i;
            gl.asyncObjArray[i].executeCallBackFunc();
            n -= 1;
        }
    }
    if( n === 0 && startBoolean==1){
       tick();
       startBoolean=0;
    }
    else{
        setTimeout( check, 500, gl );
    }
}

function tick() {
    var now = Date.now() / 1000;  
    var elapsedTime = now - then;
    then = now;

    // update the frame history.
    totalTimeForFrames += elapsedTime - (frameTimeHistory[frameTimeIndex] || 0);
    frameTimeHistory[frameTimeIndex] = elapsedTime;
    frameTimeIndex = (frameTimeIndex + 1) % numFramesToAverage;

    // compute fps
    var averageElapsedTime = totalTimeForFrames / numFramesToAverage;
    var fps = 1 / averageElapsedTime;
    // document.getElementById("fps").innerText = fps.toFixed(0); 
    //$('#fps').html(fps.toFixed(0));

    requestAnimFrame(tick);
    drawScene();

}

// setting object
function setObject(i){
	
    var objectCenter = [0.0, 1.0, 0.0];
    // init object location 
    if (i == 0) {
        objectCenter = [0.0, -0.051, 0.0];
    }
   
    // init object location
    if(i == 1){
        objectCenter = [0.1, -0.26, 0.7];
    }
    // init object location
    if(i == 2){
        objectCenter = [-0.4, 0.0, -0.7];
    }
    // init object location
    if (i == 3) {
        objectCenter = [-0.50, - 0.70, 0.50];
    }

    // initBuffers();
    var sphereObj = [];
        sphereObj[i] = createSphere(sphereRadius, 12, 12);
        sphere[i] = {};
        initBuffers(sphere[i], sphereObj[i]);
        sphere[i].center = vec3.create(objectCenter);
        sphere[i].oldcenter = vec3.create(sphere[i].center);
        sphere[i].radius = sphereObj[i].radius;
    
        objTexture[i] = gl.createTexture();
        console.log("fishes[i]",fishes[i]);
        initTexture(objTexture[i], "objs/object0" + fishes[i] + ".jpg");
        
        nowObjectNumber = i;
        initObjs(i);
        
        depthTexture[i] = gl.createTexture();
        initCustomeTexture(depthTexture[i], gl.DEPTH_COMPONENT, gl.NEAREST, gl.UNSIGNED_SHORT, gl.viewportWidth, gl.viewportHeight);
}
function setObjectAttribute(i){
        objProg[i] = gl.createProgram();
        gl.attachShader(objProg[i], getShader(gl, "obj-vs"));
        gl.attachShader(objProg[i], getShader(gl, "obj-fs"));
        gl.linkProgram(objProg[i]);

        if (!gl.getProgramParameter(objProg[i], gl.LINK_STATUS)) {
            alert("Could not initialize obj shader.");
        }
        gl.useProgram(objProg[i]);

        objProg[i].vertexPositionAttribute = gl.getAttribLocation(objProg[i], "aVertexPosition");
        objProg[i].textureCoordAttribute = gl.getAttribLocation(objProg[i], "aTextureCoord");
        objProg[i].vertexNormalAttribute = gl.getAttribLocation(objProg[i], "aVertexNormal");

        objProg[i].pMatrixUniform = gl.getUniformLocation(objProg[i], "uPMatrix");
        objProg[i].mvMatrixUniform = gl.getUniformLocation(objProg[i], "uMVMatrix");
        objProg[i].nmlMatrixUniform = gl.getUniformLocation(objProg[i], "uNmlMatrix");
        objProg[i].centerUniform = gl.getUniformLocation(objProg[i], "uCenter");
        objProg[i].sphereCenterUniform = gl.getUniformLocation(objProg[i], "uSphereCenter");
        objProg[i].sphereRadiusUniform = gl.getUniformLocation(objProg[i], "uSphereRadius");
        objProg[i].samplerWaterUniform = gl.getUniformLocation(objProg[i], "uSamplerWater");
        objProg[i].samplerCausticUniform = gl.getUniformLocation(objProg[i], "uSamplerCaustic");
        objProg[i].isSphereUniform = gl.getUniformLocation(objProg[i], "uIsSphere");
        objProg[i].causticOnUniform = gl.getUniformLocation(objProg[i], "uCausticOn");
        // objProg[i].RadiusUniform = gl.getUniformLocation(objProg[i],
        // "uRadius");
        // objProg[i].diffuseColorUniform = gl.getUniformLocation(objProg[i],
        // "uDiffuseColor");
        // objProg[i].samplerTileUniform = gl.getUniformLocation(objProg[i],
        // "uSampler");
}
function setObjectProgAttribute(i){
    //instract
    objectProg[i] = gl.createProgram();
    gl.attachShader(objectProg[i], getShader(gl, "interact-vs"));
    gl.attachShader(objectProg[i], getShader(gl, "interact-sphere-fs"));
    gl.linkProgram(objectProg[i]);

    if (!gl.getProgramParameter(objectProg[i], gl.LINK_STATUS)) {
        alert("Could not initialize interact shader.");
    }
    gl.useProgram(objectProg[i]);

    objectProg[i].vertexPositionAttribute = gl.getAttribLocation(objectProg[i], "aVertexPosition");
    objectProg[i].samplerWaterUniform = gl.getUniformLocation(objectProg[i], "uSamplerWater");
    objectProg[i].samplerTextureUniform = gl.getUniformLocation(objectProg[i], "uSamplerTexture");
    objectProg[i].newCenterUniform = gl.getUniformLocation(objectProg[i], "uNewCenter");
    objectProg[i].oldCenterUniform = gl.getUniformLocation(objectProg[i], "uOldCenter");
    objectProg[i].radiusUniform = gl.getUniformLocation(objectProg[i], "uRadius");
}

function saveObject(i){
    var objectCenter = [0.0, 0.0, 0.0];

    // console.log("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz",fishes[i]);
    if (fishes[i] == 23) {
        objectCenter = [0.0, - 0.80, -0.50];
    }

    if (fishes[i] == 7) {
        objectCenter = [0.50, -0.8, 0.0];
    }

    if (fishes[i] == 26) {
        objectCenter = [-0.70, -0.6, -0.40];
    }
    if (fishes[i] == 24) {
        objectCenter = [-0.70, -0.8, 0.40];
    }

    if (fishes[i] == 22) {
        objectCenter = [0.30, -0.85, 0.69];
    }
    // initBuffers();
    var sphereObj = [];
        sphereObj[i] = createSphere(sphereRadius, 12, 12);
        sphere[i] = {};
        initBuffers(sphere[i], sphereObj[i]);
        sphere[i].center = vec3.create(objectCenter);
        sphere[i].oldcenter = vec3.create(sphere[i].center);
        sphere[i].radius = sphereObj[i].radius;
    
        objTexture[i] = gl.createTexture();
        console.log("fishes[i]",fishes[i]);

        initTexture(objTexture[i], "objs/object0" + fishes[i] + ".jpg");

        nowObjectNumber = i;
        initObjs(i);
        
        depthTexture[i] = gl.createTexture();
        initCustomeTexture(depthTexture[i], gl.DEPTH_COMPONENT, gl.NEAREST, gl.UNSIGNED_SHORT, gl.viewportWidth, gl.viewportHeight);
        
}

function axid(){

    if(parameters.Rain == true){            
        parameters.Rain = false;

        rainaudio.pause();

        initTexture(objTexture[0], "objs/object016.jpg");
        initTexture(objTexture[1], "objs/object020.jpg");
        initTexture(objTexture[2], "objs/object021.jpg");

    }
}

function leak(){

    if(idx%2 == 0){
        initTexture(pool.Texture, "tile/cube2.jpg");
        for(var i = 3; i < fishCount; i++){
            initTexture(objTexture[i], "objs/object0" + fishes[i] + ".jpg");
        }   
        
        idx++;
        leakaudio.pause();

    }

}
function webGLStart() {
    document.getElementById("rain").onclick = function () {
        if(parameters.Rain == true){            
            parameters.Rain = false;

            rainaudio.pause();

            initTexture(objTexture[0], "objs/object016.jpg");
            initTexture(objTexture[1], "objs/object020.jpg");
            initTexture(objTexture[2], "objs/object021.jpg");

        }else{  
            parameters.Rain = true;

            rainaudio = new Audio('/music/rain.mp3');
            rainaudio.play();

            for(var i = 0; i < 3; i++){
                initTexture(objTexture[i], "objs/dirty.jpg")
            }     
        }
   };
   
    document.getElementById("ship").onclick = function () {
        if(idx%2 == 0){
            initTexture(pool.Texture, "tile/cube2.jpg");
            for(var i = 3; i < fishCount; i++){
                initTexture(objTexture[i], "objs/object0" + fishes[i] + ".jpg");
            }   
            
            idx++;
            leakaudio.pause();

        }else{
            initTexture(pool.Texture, "tile/cube5.png");
            for(var i = 3; i < fishCount; i++){
                initTexture(objTexture[i], "objs/black.png")
            }

            idx++;

            leakaudio = new Audio('/music/leak.mp3');
            leakaudio.play();

        }
    };

    document.getElementById("save").onclick = function () {
        var q = fishCount;
        fishes[q] = 23; 
        size[q] = 0.006;
        fishes[q+1] = 7;
        size[q+1] = 0.800;
        fishes[q+2] = 26;
        size[q+2] = 0.006;
        fishes[q+3] = 24;
        size[q+3] = 0.009;
        fishes[q+4] = 22;
        size[q+4] = 0.009;

        for(var i = q; i< (q + 5); i++){
            saveObject(i);
            setObjectAttribute(i);
            setObjectProgAttribute(i);
            fishCount++;
            check();
        }

        axid();
        leak();
    };
    // Initial object of fishCount == 0
    // So, additional objects are start from fishCount == 1
	document.getElementById( "btn1").onclick = function () {
	    fishes[fishCount] = fishNumbers[0];
	    size[fishCount] = fishEachsize[0];
	    setObject(fishCount);
	    setObjectAttribute(fishCount);
	    setObjectProgAttribute(fishCount);
	    fishCount++;
	    check();
	};

    document.getElementById( "btn2").onclick = function () {
	    fishes[fishCount] = fishNumbers[1];
	    size[fishCount] = fishEachsize[1];
	    setObject(fishCount);
	    setObjectAttribute(fishCount);
	    setObjectProgAttribute(fishCount);
	    fishCount++;
	    check();
	};

    document.getElementById( "btn3").onclick = function () {
	    fishes[fishCount] = fishNumbers[2];
	    size[fishCount] = fishEachsize[2];
	    setObject(fishCount);
	    setObjectAttribute(fishCount);
	    setObjectProgAttribute(fishCount);
	    fishCount++;
	    check();
	};

    document.getElementById( "btn4").onclick = function () {
	    fishes[fishCount] = fishNumbers[3];
	    size[fishCount] = fishEachsize[3];
	    setObject(fishCount);
	    setObjectAttribute(fishCount);
	    setObjectProgAttribute(fishCount);
	    fishCount++;
	    check();
	};

    document.getElementById( "btn5").onclick = function () {
	    fishes[fishCount] = fishNumbers[4];
	    size[fishCount] = fishEachsize[4];
	    setObject(fishCount);
	    setObjectAttribute(fishCount);
	    setObjectProgAttribute(fishCount);
	    fishCount++;
	    check();
	};
    var canvas = document.getElementById("the-canvas");
    initGL(canvas);

    canvas.onmousedown = handleMouseDown;
    canvas.oncontextmenu = function(ev) {return false;};
    canvas.onmousewheel   = handleMouseWheel;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;

    //enable necessry extensions.
    OES_texture_float_linear = gl.getExtension("OES_texture_float_linear");
    OES_texture_float = gl.getExtension("OES_texture_float");
    OES_texture_half_float  = gl.getExtension("OES_texture_half_float");
    OES_texture_half_float_linear = gl.getExtension("OES_texture_half_float_linear");
    OES_standard_derivatives = gl.getExtension("OES_standard_derivatives");
    WEBGL_draw_buffers = gl.getExtension( "WEBGL_draw_buffers");
    WEBGL_depth_texture = gl.getExtension( "WEBGL_depth_texture" );
    if(!WEBGL_depth_texture){
        alert("Depth Texture is not available");
    }
    //console.log(OES_standard_derivatives);

    for(var i=0; i<fishCount; i++)
    	setObject(i);

    initShaders();

    initBuffers(sky, cubeSky);
    initBuffers(pool, cubePool);
    initBuffers(water, planeWater);
    initBuffers(quad, screenQuad);

    pool.Texture = gl.createTexture();
    // initTexture(pool.Texture, "tile/tile.png");
    // initTexture(pool.Texture, "tile/wood.jpg");
    currentPoolPattern = "white brick";
    water.TextureA = gl.createTexture();
    water.TextureB = gl.createTexture();
    water.TextureC = gl.createTexture();
    for(var i=0; i<fishCount; i++)
    	depthTexture[i] = gl.createTexture();
    colorTexture = gl.createTexture();
    depthTexture2 = gl.createTexture();
    colorTexture2 = gl.createTexture();
    depthTexture3 = gl.createTexture();
    colorTexture3 = gl.createTexture();
    permTexture = gl.createTexture();
    gradTexture = gl.createTexture();
    godrayTextureA = gl.createTexture();
    godrayTextureB = gl.createTexture();

    finaldepthTexture = gl.createTexture();
    finalrenderTexture = gl.createTexture();
    postrenderTexture = gl.createTexture();

    reflectTexture = gl.createTexture();


    var filter = OES_texture_float_linear ? gl.LINEAR : gl.NEAREST;
    initCustomeTexture(water.TextureA, gl.RGBA, filter, gl.FLOAT, textureSize, textureSize);
    initCustomeTexture(water.TextureB, gl.RGBA, filter, gl.FLOAT, textureSize, textureSize);
    initCustomeTexture(water.TextureC, gl.RGBA, filter, gl.FLOAT, textureSize2, textureSize2);   // caustic
    // texture
    // is
    // 1024x1024
    for(var i=0; i<fishCount; i++)
    	initCustomeTexture(depthTexture[i], gl.DEPTH_COMPONENT, gl.NEAREST, gl.UNSIGNED_SHORT, gl.viewportWidth, gl.viewportHeight);
    initCustomeTexture(colorTexture, gl.RGBA, gl.NEAREST, gl.UNSIGNED_BYTE, gl.viewportWidth, gl.viewportHeight);
    initCustomeTexture(depthTexture2, gl.DEPTH_COMPONENT, gl.NEAREST, gl.UNSIGNED_SHORT, gl.viewportWidth, gl.viewportHeight);
    initCustomeTexture(colorTexture2, gl.RGBA, gl.NEAREST, gl.UNSIGNED_BYTE, gl.viewportWidth, gl.viewportHeight);
    initCustomeTexture(depthTexture3, gl.DEPTH_COMPONENT, gl.NEAREST, gl.UNSIGNED_SHORT, gl.viewportWidth, gl.viewportHeight);
    initCustomeTexture(colorTexture3, gl.RGBA, gl.NEAREST, gl.UNSIGNED_BYTE, gl.viewportWidth, gl.viewportHeight);
    initCustomeTexture(reflectTexture, gl.RGBA, gl.NEAREST, gl.UNSIGNED_BYTE, gl.viewportWidth, gl.viewportHeight);


    initCustomeTexture(godrayTextureA, gl.RGBA, gl.NEAREST, gl.UNSIGNED_BYTE, gl.viewportWidth, gl.viewportHeight);
    initCustomeTexture(godrayTextureB, gl.RGBA, gl.NEAREST, gl.UNSIGNED_BYTE, gl.viewportWidth, gl.viewportHeight);
    initCustomeTexture(finalrenderTexture, gl.RGBA, gl.NEAREST, gl.UNSIGNED_BYTE, gl.viewportWidth, gl.viewportHeight);
    initCustomeTexture(postrenderTexture, gl.RGBA, gl.NEAREST, gl.UNSIGNED_BYTE, gl.viewportWidth, gl.viewportHeight);
    initCustomeTexture(finaldepthTexture, gl.DEPTH_COMPONENT, gl.NEAREST, gl.UNSIGNED_SHORT, gl.viewportWidth, gl.viewportHeight);
    var successA = checkCanDrawToTexture(water.TextureA);
    var successB = checkCanDrawToTexture(water.TextureB);

    var permArray = new Uint8Array(perm);
    var gradArray = new Uint8Array(grad);
    initCustomeTexture(permTexture, gl.ALPHA, gl.NEAREST, gl.UNSIGNED_BYTE, 256, 1, permArray, gl.REPEAT, gl.CLAMP_TO_EDGE);
    initCustomeTexture(gradTexture, gl.RGB, gl.NEAREST, gl.UNSIGNED_BYTE, 16, 1, gradArray, gl.REPEAT, gl.CLAMP_TO_EDGE);



    initSkyBoxTexture();

    // initRain();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    check();
    // tick();

}


