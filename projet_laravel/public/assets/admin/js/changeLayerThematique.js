angular.module('monapp').controller('changeLayerThematique', ['$scope', '$http', 'myfactory','couche','sous_thematique',function ($scope, $http, myfactory,couche,sous_thematique) {

    console.log($scope.thematiques)

    $scope.couche =couche
    $scope.sous_thematique =sous_thematique
    $scope.selectedOccurrence = {}
    $scope.selectedOccurrence.id_sous_thematique = couche.id_sous_thematique

    $scope.ok = function () {
        
        var rang = undefined
        for (let index = 0; index < sous_thematique.length; index++) {
            const element = sous_thematique[index];
            if (element.key == $scope.selectedOccurrence.id_sous_thematique) {
                rang = index
            }
        }
        $scope.selectedOccurrence.rang_sous_them=rang
        

        // console.log(liste)
        $('#spinner').show()
        myfactory.post_data("thematique/changeLayerSousThematique", { "key_couche": couche.key_couche,"id_sous_thematique":$scope.selectedOccurrence.id_sous_thematique }).then(function (resp) {
            console.log(resp)
            $('#spinner').hide()
            if (resp.status == "ok") {
                $scope.$close($scope.selectedOccurrence);
            }else{
                alert("Un problème est survenu")
            }
        })
        
    };
    $scope.cancel = function () {
        $scope.$dismiss('cancel');
    };

}]);