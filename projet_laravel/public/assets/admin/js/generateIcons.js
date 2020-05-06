angular.module('monapp').controller('generateIconsCtrl', ['$scope', '$http', 'myfactory', function ($scope, $http, myfactory) {
  $scope.color_icon = "#fff";
  $scope.color_arriere_plan = "#f06";

  console.log($scope)

  $scope.$watch('color_icon', function (val) {
    // console.log('color_icon ' + val);
    if ($scope.icon_clone && $scope.draw_rect) {
      update_color()
    }
  });

  $scope.$watch('color_arriere_plan', function (val) {
    // console.log('color_arriere_plan ' + val);
    if ($scope.icon_clone && $scope.draw_rect) {
      update_color()
    }
  });


  $scope.iconsProviders = []
  $http.get('assets/maki/all.json').then(function (data) {
    var icons = []
    // console.log(data)
    for (const key in data.data.all) {
      if (data.data.all.hasOwnProperty(key)) {
        const element = data.data.all[key];
        $scope.iconsProviders.push({
          nom_icon: element,
          path: 'assets/maki/icons/' + element + '-15.svg'
        })
      }
    }

    //   attributions: 'https://labs.mapbox.com/maki-icons/'
   
  });

  $http.get('assets/temaki/all.json').then(function (data) {
    var icons = []
    // console.log(data)
    for (const key in data.data.all) {
      if (data.data.all.hasOwnProperty(key)) {
        const element = data.data.all[key];
        $scope.iconsProviders.push({
          nom_icon: element,
          path: 'assets/temaki/icons/' + element
        })
      }
    }
    //   attributions: 'https://github.com/ideditor/temaki'
  });

  $http.get('assets/osm_icons/all.json').then(function (data) {
    var icons = []
    // console.log(data)
    for (const key in data.data.all) {
      if (data.data.all.hasOwnProperty(key)) {
        const element = data.data.all[key];
        $scope.iconsProviders.push({
          nom_icon: element,
          path: 'assets/osm_icons/icons/' + element
        })
      }
    }
  });


  // $http.get('assets/noun_project/all.json').then(function (data) {
  //   var icons = []
  //   console.log(data)
  //   for (const key in data.data.all) {
  //     if (data.data.all.hasOwnProperty(key)) {
  //       const element = data.data.all[key];
  //       icons.push({
  //         nom_icon: element,
  //         path: 'assets/noun_project/icons/' + element
  //       })
  //     }
  //   }

  //   // $scope.iconsProviders.push({
  //   //   nom: 'Noun Project',
  //   //   list: icons,
  //   //   attributions: 'https://thenounproject.com/'
  //   // })
  // });

  function loadSvgContents(url) {
    var id = 'iconOrigin'
    document.getElementById(id).innerHTML = ''
    document.getElementById('bloc_svg_circle').innerHTML = ''
    document.getElementById('bloc_svg_rect').innerHTML = ''

    xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    // Following line is just to be on the safe side;
    // not needed if your server delivers SVG with correct MIME type
    xhr.overrideMimeType("image/svg+xml");
    xhr.send("");
    document.getElementById(id).appendChild(xhr.responseXML.documentElement);

    $scope.draw_circle = SVG().addTo('#bloc_svg_circle').size(100, 100)
    $scope.draw_circle.circle(100).attr({ fill: $scope.color_arriere_plan })

    $scope.draw_rect = SVG().addTo('#bloc_svg_rect').size(100, 100)
    $scope.draw_rect.rect(100, 100).radius(10).attr({ fill: $scope.color_arriere_plan })

    $scope.icon = SVG('#iconOrigin svg').size(80, 80)


    $scope.icon_clone = $scope.icon.clone()

    $scope.icon.addTo($scope.draw_circle)
    $scope.icon.move(10, 7)


    $scope.icon_clone.addTo($scope.draw_rect)
    $scope.icon_clone.move(10, 7)

    update_color()

    // console.log(icon)
  }

  function update_color() {
    $scope.draw_rect.each(function (i, children) {
      this.fill({ color: $scope.color_arriere_plan })
    }, true)

    $scope.draw_circle.each(function (i, children) {
      this.fill({ color: $scope.color_arriere_plan })
    }, true)

    $scope.icon.each(function (i, children) {
      console.log($scope.color_icon, $scope.color_arriere_plan)
      this.fill({ color: $scope.color_icon })
    }, true)

    $scope.icon_clone.each(function (i, children) {
      this.fill({ color: $scope.color_icon })
    }, true)

  }



  $scope.chooseIcon = function (icon) {
    loadSvgContents(icon.path)
  }

  $scope.ok = function () {
    // var parser = new DOMParser();
    // xmlDoc = parser.parseFromString(document.getElementById('bloc_svg_circle').innerHTML,"text/xml");
    //  console.log(xmlDoc.documentElement)

    // myfactory.post_data("whriteSvg", { "svg":document.getElementById('bloc_svg_circle').innerHTML }).then(function (resp) {
    //     console.log(resp)

    // }, function (msg) {
    //     toogle_information("Verifier votre connexion")
    // })

    $scope.$close({
      rect: document.getElementById('bloc_svg_rect').innerHTML,
      circle: document.getElementById('bloc_svg_circle').innerHTML
    });
  };
  $scope.cancel = function () {
    $scope.$dismiss('cancel');
  };

}]);