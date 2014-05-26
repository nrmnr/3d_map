// 3D Map メイン
$(
function(){
  var PI = 3.1415926;
  var rad = function(deg){
    return deg * PI / 180;
  };

  var make_camera = function(width, height){
    var fov    = 60;             // 画角
    var aspect = width / height;
    var near   = 1;              // これより近くは非表示
    var far    = 1000;           // これより遠くは非表示
    return new THREE.PerspectiveCamera(fov, aspect, near, far);
  };

  var make_renderer = function(width, height){
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    $("body").append($(renderer.domElement));
    return renderer;
  };

  var make_light = function(){
    var light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 0.0, 0.7);
    return light;
  };

  var make_hemilight = function(){
    light = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    light.color.setHSL(0.6, 1, 0.6);
    light.groundColor.setHSL(0.095, 1, 0.75);
    light.position.set(0, 500, 0);
    return light;
  };

  var make_mesh = function(){
    var geometry = new THREE.BoxGeometry(300, 300, 30);
    var material = new THREE.MeshPhongMaterial({ color: 0xffffff });
    return new THREE.Mesh(geometry, material);
  };

  var main = function(){
    var width  = 1024;
    var height = 768;
    var camera = make_camera(width, height);
    camera.position.set(0, 0, 300);
    var controls = new THREE.TrackballControls(camera);
    controls.noPan = false;
    var renderer = make_renderer(width, height);
    var scene = new THREE.Scene();
    scene.add(make_light());
    scene.add(make_hemilight());
    var mesh = make_mesh();
    scene.add(mesh);

    (function renderLoop() {
      requestAnimationFrame(renderLoop);
      // mesh.rotation.set(
      //   -rad(60),
      //   0,
      //   mesh.rotation.z + .01
      // );
      renderer.render(scene, camera);
      controls.update();
    })();
  };

  main();
});
