// 3D Map メイン
$(
function(){
  var make_camera = function(width, height){
    var fov    = 60;             // 画角
    var aspect = width / height;
    var near   = 1;              // これより近くは非表示
    var far    = 20000;          // これより遠くは非表示
    var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(-50, 20, 0);
    return camera;
  };

  var make_renderer = function(width, height){
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    renderer.setClearColor(0xc0e0ff);
    $("#mapfield").append(renderer.domElement);
    return renderer;
  };

  var make_light = function(){
    var light = new THREE.DirectionalLight(0xffffff, 0.7);
    light.position.set(0.7, 0.5, 0);
    return light;
  };

  var make_ambientlight = function(){
    return new THREE.AmbientLight(0x909090);
  };

  var make_hemilight = function(){
    var light = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    light.color.setHSL(0.6, 1, 0.6);
    light.groundColor.setHSL(0.095, 1, 0.75);
    light.position.set(0, 500, 0);
    return light;
  };

  var initial_rotate = function(mesh){
    var matrix = new THREE.Matrix4();
    mesh.applyMatrix(matrix.makeRotationX(-Math.PI/2));
    mesh.applyMatrix(matrix.makeRotationY(-Math.PI/2));
    return mesh;
  };

  var load_map = function(){
    var csv = $.ajax({
        type: "GET",
        url: "map/dem.csv",
        async: false
      }).responseText;
    var geometry = new THREE.PlaneGeometry(96,96,191,191);
    var count = 0;
    $(csv.split("\n")).each(
      function(){
        var line = this;
        if (line == "") return;
        $(line.split(",")).each(
          function(){
            var value = this;
            var h = (value == "e")? 0 : Number(value);
            geometry.vertices[count++].z = h;
          });
      });
    var material = new THREE.MeshPhongMaterial({
      map: THREE.ImageUtils.loadTexture("map/texture.png")
    });
    var mesh = new THREE.Mesh(geometry, material);
    return initial_rotate(mesh);
  };

  var make_mesh = function(){
    return load_map();
  };

  var make_controls = function(camera){
    var controls = new THREE.FirstPersonControls(camera);
    controls.movementSpeed = 20;
    controls.lookSpeed = 0.1;
    //controls.activeLook = false;
    controls.lat = -30;
    return controls;
  };

  var main = function(){
    var width  = 1024;
    var height = 768;
    var scene = new THREE.Scene();
    scene.add(make_light());
    scene.add(make_ambientlight());
    //scene.add(make_hemilight());
    var mesh = make_mesh();
    scene.add(mesh);

    var camera = make_camera(width, height);
    var controls = make_controls(camera);
    var renderer = make_renderer(width, height);

    var clock = new THREE.Clock();
    (function renderLoop() {
      requestAnimationFrame(renderLoop);
      renderer.render(scene, camera);
      controls.update(clock.getDelta());
    })();
  };

  main();
});
