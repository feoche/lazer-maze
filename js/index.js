var app = angular.module('app', [])
  .controller('AppController', ['$scope', '$http', function($scope, $http) {
    var vm = this;
    
    vm.init = function() {
      vm.cells = [];
      vm.types = ['default', 'mirror-1', 'start'];
      vm.pos = ['up', 'right', 'down', 'left'];
      vm.createGrid();
      
      // Adding special items
      createSituation();
      
      // Adjusting beams regarding items
      adjustBeams();
    };
    
    vm.createGrid = function(){
      var cells = vm.cells
      // Creating the grid w/ default values
      for(var i=0; i<5; i++) {
        cells[i] = [];
        for(var j=0; j<5; j++) {
          cells[i][j] = {
            x: j,
            y: i,
            type: 'default',
            pos: 'up'
          };
        }
      }
    };
    
    var createSituation = function() {
      var cells = vm.cells
      cells[4][1] = {
        type: 'start',
        pos: 'up'
      },
      cells[1][1] = {
        type: 'mirror-1',
        pos: 'right'
      },
      cells[1][4] = {
        type: 'mirror-1',
        pos: 'down'
      };
    };
    
    var adjustBeams = function() {
      var cells = vm.cells;
      for(var i=0; i<5; i++) {
        for(var j=0; j<5; j++) {
          var cell = cells[i][j];
          cell.beams = [];
        }
      }
      for(var i=0; i<5; i++) {
        for(var j=0; j<5; j++) {
          var cell = cells[i][j];
          cell.x = j;
          cell.y = i;
          if(cell.type === 'start') {
            cell.beams.push({
              type: cell.type,
              pos: cell.pos
            });
            makeWayForBeam(i, j, cell.pos); 
          }
        }
      }
    };
    
    var makeWayForBeam = function (i, j, pos) {
      var cells = vm.cells,
          cell = cells[i][j];
      
      var upItem = i > 0 && cells[i-1][j],
          upPos = pos === 'up',
          rightItem = j < cells[i].length - 1 && cells[i][j+1],
          rightPos = pos === 'right',
          downItem = i < cells[i].length - 1 && cells[i+1][j],
          downPos = pos === 'down',
          leftItem = j > 0 && cells[i][j-1],
          leftPos = pos === 'left';
      
      var nextItem = (upPos && upItem) || (rightPos && rightItem) || (downPos && downItem) || (leftPos && leftItem),
          nextPos = 'up';
      
      switch(nextItem.type) {
        case 'mirror-1':
          switch(nextItem.pos) {
            case 'up': // DOWN & LEFT(T) BLOCKED
              nextItem.beams.push({
                type: upPos || rightPos? 'end' : 'angle',
                pos: pos
              });
              if(upPos || rightPos){return;}
              nextPos = downPos? 'right' : 'up';
              break;
            case 'right': // LEFT & UP(T) BLOCKED
              nextItem.beams.push({
                type: rightPos || downPos? 'end' : 'angle',
                pos: downPos? 'right': rightPos? 'up' : pos
              });
              if(rightPos || downPos){return;}
              nextPos = upPos? 'right' : 'down';
              break;
            case 'down': // UP & RIGHT(T) BLOCKED
              nextItem.beams.push({
                type: downPos || leftPos? 'end' : 'angle',
                pos: downPos? 'up' : leftPos? 'right' : pos
              });
              if(downPos || leftPos){return;}
              nextPos = upPos? 'left' : 'down';
              break;
            case 'left': // RIGHT & DOWN(T) BLOCKED
              nextItem.beams.push({
                type: leftPos || upPos? 'end' : 'angle',
                pos: upPos? 'right' : leftPos? 'up' : pos
              });
              if(leftPos || upPos){return;}
              nextPos = downPos? 'left' : 'up';
              break;
          }
          break;
        case 'default':
          nextItem.beams.push({
            type: 'default',
            pos: pos
          });
          nextPos = pos;
          break;
        default:
          return;
          break;
      }
      makeWayForBeam(nextItem.y, nextItem.x, nextPos);
      return;
    };
    
    vm.chooseType = function(row, index) {
      var cell = vm.cells[row][index];
      cell.type = vm.types[(vm.types.indexOf(cell.type)+1) % vm.types.length];
      adjustBeams();
    };
    
    vm.rotate = function(row, index) {
      var cell = vm.cells[row][index];
      cell.pos = vm.pos[(vm.pos.indexOf(cell.pos)+1) % vm.pos.length];
      adjustBeams();
    };
  }])
  .directive('ngRightClick', function($parse) {
      return function(scope, element, attrs) {
          var fn = $parse(attrs.ngRightClick);
          element.bind('contextmenu', function(event) {
              scope.$apply(function() {
                  event.preventDefault();
                  fn(scope, {$event:event});
              });
          });
      };
  });