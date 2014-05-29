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

  var load_map = function(csvfile){
    var csv = $.ajax({
        type: "GET",
        url: "map/" + csvfile,
        async: false
      }).responseText;
    var data = [];
    $(csv.split("\n")).each(
      function(){
        var line = this;
        if (line == "") return;
        $(line.split(",")).each(
          function(){
            var value = this;
            var h = (value == "e")? 0 : Number(value);
            data.push(h);
          });
      });
    return data;
  };

  var x1 = 96, x2 = 192;
  var y1 = 96, y2 = 192;

  // オブジェクト 地図
  var make_map = function(data, texture){
    var geometry = new THREE.PlaneGeometry(x1, y1, x2-1, y2-1);
    for (var i = 0; i < data.length; ++i){
      geometry.vertices[i].z = data[i];
    }
    var material = new THREE.MeshPhongMaterial({
      map: THREE.ImageUtils.loadTexture("map/" + texture)
    });
    var mesh = new THREE.Mesh(geometry, material);
    return initial_rotate(mesh);
  };

  // オブジェクト 側面手前
  var make_side_front = function(data){
    var geometry = new THREE.PlaneGeometry(x1, 1, x2-1, 1);
    for(var i = 0; i < geometry.vertices.length; ++i){
      geometry.vertices[i].z = (i < x2)? data[(y2-1)*x2+i] : 0;
      geometry.vertices[i].y = -(y1/2);
    }
    var material = new THREE.MeshBasicMaterial({color: 0xb97a57});
    var mesh = new THREE.Mesh(geometry, material);
    return initial_rotate(mesh);
  };

  // オブジェクト 側面奥
  var make_side_back = function(data){
    var geometry = new THREE.PlaneGeometry(x1, 1, x2-1, 1);
    for(var i = 0; i < geometry.vertices.length; ++i){
      geometry.vertices[i].z = (i < x2)? data[x2-1-i] : 0;
      geometry.vertices[i].x = x1/2-x1/(x2-1)*(i%x2);
      geometry.vertices[i].y = y1/2;
    }
    var material = new THREE.MeshBasicMaterial({color: 0xb97a57});
    var mesh = new THREE.Mesh(geometry, material);
    return initial_rotate(mesh);
  };

  // オブジェクト 側面左
  var make_side_left = function(data){
    var geometry = new THREE.PlaneGeometry(y1, 1, y2-1, 1);
    for(var i = 0; i < geometry.vertices.length; ++i){
      geometry.vertices[i].z = (i < y2)? data[i*x2] : 0;
      geometry.vertices[i].x = -(x1/2);
      geometry.vertices[i].y = (y1/2)-y1/(y2-1)*(i%y2);
    }
    var material = new THREE.MeshBasicMaterial({color: 0xb97a57});
    var mesh = new THREE.Mesh(geometry, material);
    return initial_rotate(mesh);
  };

  // オブジェクト 側面右
  var make_side_right = function(data){
    var geometry = new THREE.PlaneGeometry(y1, 1, y2-1, 1);
    for(var i = 0; i < geometry.vertices.length; ++i){
      geometry.vertices[i].z = (i < y2)? data[x2*(y2-1-i)+(x2-1)] : 0;
      geometry.vertices[i].x = x1/2;
      geometry.vertices[i].y = -(y1/2)+y1/(y2-1)*(i%y2);
    }
    var material = new THREE.MeshBasicMaterial({color: 0xb97a57});
    var mesh = new THREE.Mesh(geometry, material);
    return initial_rotate(mesh);
  };

  // オブジェクト 底面
  var make_side_base = function(){
    var geometry = new THREE.PlaneGeometry(x1, y1, 1, 1);
    for(var i = 0; i < geometry.vertices.length; ++i){
      geometry.vertices[i].z = 0;
      geometry.vertices[0].y = -(x1/2);
      geometry.vertices[1].y = -(y1/2);
      geometry.vertices[2].y = x1/2;
      geometry.vertices[3].y = y1/2;
    }
    var material = new THREE.MeshBasicMaterial({color: 0x7b4d33});
    var mesh = new THREE.Mesh(geometry, material);
    return initial_rotate(mesh);
  };

  var make_mesh = function(scene){
    var map_data = load_map("dem.csv");
    scene.add(make_map(map_data, "texture.png"));
    scene.add(make_side_front(map_data));
    scene.add(make_side_back(map_data));
    scene.add(make_side_left(map_data));
    scene.add(make_side_right(map_data));
    scene.add(make_side_base());
  };

  var make_controls = function(camera){
    var controls = new THREE.FirstPersonControls(camera);
    controls.movementSpeed = 10;
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
    make_mesh(scene);

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
