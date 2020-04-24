<!DOCTYPE html>
<html lang="fr">
<base href="../../public/asssets/">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">
    <meta name="author" content="">
    <title>Admin GeoCameroun</title>
    <!-- Bootstrap Core CSS -->
    
    <link href="assets/admin/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet"> 

    <!-- Menu CSS -->
    <link href="assets/admin/bower_components/sidebar-nav/dist/sidebar-nav.min.css" rel="stylesheet"> 
    <!-- toast CSS -->
    <link href="assets/admin/bower_components/toast-master/css/jquery.toast.css" rel="stylesheet"> 
    <!-- morris CSS -->
    <link href="assets/admin/bower_components/morrisjs/morris.css" rel="stylesheet"> 
    <!-- animation CSS -->
     <link href="assets/admin/css/animate.css" rel="stylesheet"> 
    <!-- Custom CSS -->
    <link href="assets/admin/css/utilisateur.css" rel="stylesheet"> 
    
    <link href="assets/admin/css/style.css" rel="stylesheet"> 

    <link href="assets/admin/css/checkbox.css" rel="stylesheet"> 
    <!-- color CSS -->
    <link href="assets/admin/css/colors/blue-dark.css" rel="stylesheet"> 

     <link rel="stylesheet" type="text/css" href="assets/css/ol4.css">

    <link rel="stylesheet" type="text/css" href="assets/admin/css/angular-color-picker.css ">
    <link rel="stylesheet" type="text/css" href="assets/admin/css/angular-color-picker1.css">
    <link rel="stylesheet" type="text/css" href="assets/css/textAngular.css">
</head>

<body ng-app="monapp">
        
    <div ng-controller="mainCtrl">
          <div ng-view></div>
    </div>
    <footer class="footer text-center" style="left: 0px !important;" > GeoOSM, Developed by TANK & Anas</footer> 
</body>

<script type="text/javascript" src="assets/config.js"></script>
<script type="text/javascript" src="assets/admin/js/angular.js"></script>
<script type="text/javascript" src="assets/admin/js/angular-route-min.js"></script>
<script type="text/javascript" src="assets/js/angular-animate.min.js"></script>
<script type="text/javascript" src="assets/js/angular-sanitize.js"></script>
<script type="text/javascript" src="assets/admin/js/ui-bootstrap-2.5.0.min.js"></script>
<script type="text/javascript" src="assets/admin/bower_components/jquery/dist/jquery.min.js"></script>
<script type="text/javascript" src="assets/admin/bootstrap/dist/js/bootstrap.min.js"></script>
<script type="text/javascript" src="assets/admin/js/bootstrap-confirmation.js"></script>
<script type="text/javascript" src="assets/admin/js/jquery.slimscroll.js"></script>
<script type="text/javascript" src="assets/admin/js/waves.js"></script>
<script type="text/javascript" src="assets/admin/bower_components/waypoints/lib/jquery.waypoints.js"></script>
<script type="text/javascript" src="assets/admin/bower_components/counterup/jquery.counterup.min.js"></script>
<script type="text/javascript" src="assets/js/ol4.js"></script>
<script type="text/javascript" src="assets/js/angular-openlayers-directive.js"></script>

<!-- <script type="text/javascript" src="assets/admin/bower_components/raphael/raphael-min.js"></script> -->
<!-- <script type="text/javascript" src="assets/admin/bower_components/morrisjs/morris.js"></script> -->
<!-- <script type="text/javascript" src="assets/admin/js/custom.min.js"></script> -->
<!-- <script type="text/javascript" src="assets/admin/js/dashboard1.js"></script> -->
<script type="text/javascript" src="assets/admin/bower_components/toast-master/js/jquery.toast.js"></script>
<!-- http://textangular.com/ -->
<script src="assets/js/textAngular-rangy.min.js"></script>
<script src="assets/js/textAngular-sanitize.min.js"></script>
<script src="assets/js/textAngular.min.js"></script>

<script type="text/javascript" src="assets/admin/js/app.js"></script>

<script src="assets/js/bootstrap-colorpicker.min.js"></script>
<script src="assets/js/bootstrap-colorpicker-plus.js"></script>
<script type="text/javascript" src="assets/js/dessinController.js"></script>
<script type="text/javascript" src="assets/js/impressionController.js"></script>
<script type="text/javascript" src="assets/admin/js/tinycolor.min.js " ></script>
<script type="text/javascript" src="assets/admin/js/angular-color-picker.js " ></script>

<!-- https://www.npmjs.com/package/angularjs-color-picker -->

   
<script>
          
            $('[data-toggle=confirmation]').confirmation({
              rootSelector: '[data-toggle=confirmation]',
              container: 'body'
            });
            $('[data-toggle=confirmation-singleton]').confirmation({
              rootSelector: '[data-toggle=confirmation-singleton]',
              container: 'body'
            });
            $('[data-toggle=confirmation-popout]').confirmation({
              rootSelector: '[data-toggle=confirmation-popout]',
              container: 'body'
            });
          
            $('#confirmation-delegate').confirmation({
              selector: 'button'
            });
          
            var currency = '';
            $('#custom-confirmation').confirmation({
              rootSelector: '#custom-confirmation',
              container: 'body',
              title: null,
              onConfirm: function(currency) {
                alert('You choosed ' + currency);
              },
              buttons: [
                {
                  class: 'btn btn-danger',
                  icon: 'glyphicon glyphicon-usd',
                  value: 'US Dollar'
                },
                {
                  class: 'btn btn-primary',
                  icon: 'glyphicon glyphicon-euro',
                  value: 'Euro'
                },
                {
                  class: 'btn btn-warning',
                  icon: 'glyphicon glyphicon-bitcoin',
                  value: 'Bitcoin'
                },
                {
                  class: 'btn btn-default',
                  icon: 'glyphicon glyphicon-remove',
                  cancel: true
                }
              ]
            });
          
            $('#custom-confirmation-links').confirmation({
              rootSelector: '#custom-confirmation-link',
              container: 'body',
              title: null,
              buttons: [
                {
                  label: 'Twitter',
                  attr: {
                    href: 'https://twitter.com'
                  }
                },
                {
                  label: 'Facebook',
                  attr: {
                    href: 'https://facebook.com'
                  }
                },
                {
                  label: 'Pinterest',
                  attr: {
                    href: 'https://pinterest.com'
                  }
                }
              ]
            });
</script>

</html>
