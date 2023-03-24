import { Injectable } from '@angular/core';
import * as Chart from 'chart.js';
import 'chartjs-chart-timeline';
import { DatePipe } from '@angular/common';

@Injectable({providedIn: 'root'})

export class ChartjsService {

  constructor(
  ) {
    this.create360DoughnutModel();
    this.create270DoughnutModel();
    this.createPieWithLabels();
    this.createTimelineWithLines();
    this.createRoundedBarChart()
    // this.createScatterWithLines();
  }

  // createScatterWithLines(){
  //   Chart.defaults.scatterWithLines = Chart.helpers.clone(Chart.defaults.scatter);
  //   Chart.controllers.scatterWithLines = Chart.controllers.scatter.extend({
  //     draw: function() {
  //       // Chart.controllers.scatter.prototype.draw.call(this);
  //       Chart.controllers.scatter.prototype.draw.call(this);
  //       // const self = this;
  //       // const chart = self.chart;
  //       // const opts = chart.options;
  //       // const totalHeight = chart.chartArea.bottom - chart.chartArea.top;
  //       // self.chart.ctx.save();
  //       // opts.pointsColors.map(el=>{
  //       //   const lineStart = (totalHeight * el.min);
  //       //   const lineEnd = (totalHeight  * el.max);
  //       //   self.chart.ctx.beginPath();
  //       //   self.chart.ctx.moveTo(chart.chartArea.left, (totalHeight - lineStart) );
  //       //   self.chart.ctx.lineWidth = 3;
  //       //   self.chart.ctx.strokeStyle = el.color;
  //       //   self.chart.ctx.lineTo(chart.chartArea.left, (totalHeight - lineEnd) );
  //       //   self.chart.ctx.stroke();
  //       //   self.chart.ctx.closePath();
  //       // });
  //       // self.chart.ctx.restore();
  //     }
  //   });
  // }

  createTimelineWithLines() {
    // console.log('createTimelineWithLines')
    Chart.defaults.timelineWithLines = Chart.helpers.clone(Chart.defaults.timeline);
    var originalLineDraw = Chart.controllers.line.prototype.draw;
    const helpers = Chart.helpers;
    Chart.controllers.timelineWithLines = Chart.controllers.timeline.extend({


      draw: function () {
        const self = this;
        originalLineDraw.apply(this, arguments);
        const chart = self.chart;
        const opts = chart.options;

        chart.options.lineCount = chart.options.lineCount + 1;
        if (chart.options.lineCount == (opts.numOfChartLine)) { //this trick for draw teams line only when all charts lines drawed
          chart.options.lineCount = 0
          const shiftPoints = [];

          const dataset = chart.data.datasets[chart.data.datasets.length - 1];
          const k = Object.keys(dataset._meta)[0];
          dataset.data.map((row, index) => {
            shiftPoints.push(dataset._meta[k].data[index]);
          })
          shiftPoints.map(point => {
            if(point) {
              if(point._model.x >= chart.chartArea.left) {
                self.chart.ctx.beginPath();
                self.chart.ctx.moveTo(point._model.x, chart.chartArea.top);
                self.chart.ctx.lineWidth = 2;
                self.chart.ctx.strokeStyle = '#ff0000';
                self.chart.ctx.lineTo(point._model.x, chart.chartArea.bottom + 2);
                self.chart.ctx.stroke();
                self.chart.ctx.closePath();

                self.chart.ctx.font = '14px Koerber';
                self.chart.ctx.fillStyle ='#ff0000';
                self.chart.ctx.textAlign = 'end';
                self.chart.ctx.fillText(dataset.data[point._index][2], point._model.x - 6, chart.chartArea.bottom +2);

                self.chart.ctx.font = '14px Koerber';
                self.chart.ctx.fillStyle ='#ff0000';
                self.chart.ctx.textAlign = 'start';
                self.chart.ctx.fillText(dataset.data[point._index][1], point._model.x + 6, chart.chartArea.bottom +2);

              }
            }
          });
        }

          /** BLUE LINE "NOW" */
          // self.chart.ctx.beginPath();
          // self.chart.ctx.moveTo(chart.chartArea.right, chart.chartArea.top);
          // self.chart.ctx.lineWidth = 2;
          // self.chart.ctx.strokeStyle = '#0000ff';
          // self.chart.ctx.lineTo(chart.chartArea.right, chart.chartArea.bottom + 16);
          // self.chart.ctx.stroke();
          // self.chart.ctx.closePath();
          // self.chart.ctx.font = '14px Koerber';
          // self.chart.ctx.fillStyle ='#0000ff';
          // self.chart.ctx.textAlign = 'end';
          // self.chart.ctx.fillText('Now', chart.chartArea.right - 4, chart.chartArea.bottom +16);
          }

    });
    return true;
  }

  create270DoughnutModel() {


    Chart.defaults.doughnut270 = Chart.helpers.clone(Chart.defaults.doughnut);

    const helpers = Chart.helpers;

    helpers.extend(Chart.defaults.doughnut, {
      datasetRadiusBuffer: 0
    });

    Chart.controllers.doughnut270 = Chart.controllers.doughnut.extend({
      updateElement: function(arc, index, reset) {
        const self = this;
        const chart = self.chart,
          chartArea = chart.chartArea,
          opts = chart.options,
          animationOpts = opts.animation,
          arcOpts = opts.elements.arc,
          centerX = (chartArea.left + chartArea.right) / 2,
          centerY = (chartArea.top + chartArea.bottom) / 2,
          startAngle = opts.rotation, // non reset case handled later
          endAngle = opts.rotation, // non reset case handled later
          dataset = self.getDataset(),
          circumference = reset && animationOpts.animateRotate
            ? 0 : arc.hidden
            ? 0 : self.calculateCircumference(dataset.data[index]) * (opts.circumference / (2.0 * Math.PI)),
          innerRadius = reset && animationOpts.animateScale ? 0 : self.innerRadius,
          outerRadius = reset && animationOpts.animateScale ? 0 : self.outerRadius -3,
          custom = arc.custom || {},
          valueAtIndexOrDefault = helpers.getValueAtIndexOrDefault;

          // console.log(outerRadius,
          //   innerRadius, valueAtIndexOrDefault(dataset.label, index, chart.data.labels[index]));

        helpers.extend(arc, {
          // Utility
          _datasetIndex: self.index,
          _index: index,

          // Desired view properties

          _model: {
            x: centerX + chart.offsetX,
            y: centerY + chart.offsetY,
            startAngle: startAngle,
            endAngle: endAngle,
            circumference: circumference,
            outerRadius: outerRadius,
            innerRadius: innerRadius,
            label: function() {
              return valueAtIndexOrDefault(dataset.label, index, chart.data.labels[index])
            },
          },

          draw: function () {
            const ctx = this._chart.ctx,
              vm = this._view,
              sA = vm.startAngle,
              eA = vm.endAngle,
              opts = this._chart.config.options;

            const labelPos = this.tooltipPosition();
            const segmentLabel = vm.circumference / opts.circumference * 100;

            ctx.beginPath();
            ctx.arc(vm.x, vm.y, vm.outerRadius, sA, eA);
            ctx.arc(vm.x, vm.y, vm.innerRadius, eA, sA, true);

            ctx.closePath();
            ctx.strokeStyle = vm.borderColor;
            ctx.lineWidth = vm.borderWidth;

            ctx.fillStyle = vm.backgroundColor;

            ctx.fill();
            ctx.lineJoin = 'bevel';

            if (vm.borderWidth) {
              ctx.stroke();
            }

            // if (vm.circumference > 0.0015) { // Trying to hide label when it doesn't fit in segment
              ctx.beginPath();
              ctx.fillStyle = '#190707';
              ctx.textBaseline = 'top';
              ctx.textAlign = 'right';

              // Round percentage in a way that it always adds up to 100%
              const ring = this._chart.data.datasets[this._datasetIndex];
              const value = ring.labels[this._index];
              if (value) {
                ctx.font = helpers.fontString(opts.defaultFontSize, opts.defaultFontStyle, opts.defaultFontFamily);
                ctx.fillText(value , vm.x - 38, this._datasetIndex * opts.defaultFontSize + 1);
                ctx.font = helpers.fontString(opts.defaultFontSize, 'Regular', opts.defaultFontFamily);
                ctx.fillText(segmentLabel.toFixed(0) + '%', vm.x - 4, this._datasetIndex * opts.defaultFontSize +1);
              }

              // display in the center the total sum of all segments
              const total = dataset.data.reduce((sum, val) => sum + val, 0);
              ctx.textAlign = 'center';
              ctx.font = helpers.fontString(opts.defaultFontSize, 'Regular', opts.defaultFontFamily);
              ctx.fillText('OEE', vm.x, vm.y - 16, 200);
              if (opts.custom?.oee !== null && opts.custom?.oee !== undefined) {
                ctx.fillText(opts.custom.oee + '%', vm.x, vm.y, 200);
              } else {
                ctx.fillText(total + '%', vm.x, vm.y, 200);
              }
            // }
          },
        });

        const model = arc._model;
        model.backgroundColor = custom.backgroundColor ? custom.backgroundColor :
          valueAtIndexOrDefault(dataset.backgroundColor, index, arcOpts.backgroundColor);
        model.hoverBackgroundColor = custom.hoverBackgroundColor ? custom.hoverBackgroundColor :
          valueAtIndexOrDefault(dataset.hoverBackgroundColor, index, arcOpts.hoverBackgroundColor);
        model.borderWidth = custom.borderWidth ? custom.borderWidth :
          valueAtIndexOrDefault(dataset.borderWidth, index, arcOpts.borderWidth);
        model.borderColor = custom.borderColor ? custom.borderColor :
          valueAtIndexOrDefault(dataset.borderColor, index, arcOpts.borderColor);



        // Set correct angles if not resetting
        if (!reset || !animationOpts.animateRotate) {
          if (index === 0) {
            model.startAngle = opts.rotation;
          } else {
            model.startAngle = self.getMeta().data[index - 1]._model.endAngle;
          }

          model.endAngle = model.startAngle + model.circumference;
        }

        arc.pivot();
      },
    });
  }

  create360DoughnutModel() {
    function secondsConvert(n) {
      const num = n/60;
      const hours = (num / 60);
      const rhours = Math.floor(hours);
      const minutes = (hours - rhours) * 60;
      const rminutes = Math.round(minutes);
      return (rhours === 0 ? '' : rhours + 'h ') + `${rminutes}min`;
    }
    function minutesConvert(n) {
      const num = n;
      const hours = (num / 60);
      const rhours = Math.floor(hours);
      const minutes = (hours - rhours) * 60;
      const rminutes = Math.round(minutes);
      return (rhours === 0 ? '' : rhours + 'h ') + `${rminutes}min`;
    }

    Chart.defaults.doughnut360 = Chart.helpers.clone(Chart.defaults.doughnut);
    const helpers = Chart.helpers;
    Chart.controllers.doughnut360 = Chart.controllers.doughnut.extend({
      updateElement: function(arc, index, reset) {
        const self = this;
        const chart = self.chart,
          chartArea = chart.chartArea,
          opts = chart.options,
          animationOpts = opts.animation,
          arcOpts = opts.elements.arc,
          centerX = (chartArea.left + chartArea.right) / 2,
          centerY = (chartArea.top + chartArea.bottom) / 2,
          startAngle = opts.rotation, // non reset case handled later
          endAngle = opts.rotation, // non reset case handled later
          dataset = self.getDataset(),
          circumference = reset && animationOpts.animateRotate
            ? 0 : arc.hidden
            ? 0 : self.calculateCircumference(dataset.data[index]) * (opts.circumference / (2.0 * Math.PI)),
          innerRadius = reset && animationOpts.animateScale ? 0 : self.innerRadius,
          outerRadius = reset && animationOpts.animateScale ? 0 : self.outerRadius,
          custom = arc.custom || {},
          valueAtIndexOrDefault = helpers.getValueAtIndexOrDefault;

        /**
         * CUSTOM LEGEND
         */
        let value = dataset.data[index];
        if (opts.custom.uom_type === 'seconds') {
          const pipe = new DatePipe('en-US');

          value = pipe.transform(value * 1000 * 60, 'HH:mm');
        }
        if (opts.custom.uom_type === 'minutes') {
          const pipe = new DatePipe('en-US');

          value = pipe.transform(value * 1000 * 60, 'HH:mm');
        }
        if( chart.legend.legendItems[index] ) {
          chart.legend.legendItems[index].text = chart.data.labels[index] + ' ' + value; // legend text
        }
        chart.legend.options.labels.generateLabels(chart);

        helpers.extend(arc, {
          // Utility
          _datasetIndex: self.index,
          _index: index,

          // Desired view properties
          _model: {
            x: centerX + chart.offsetX,
            y: centerY + chart.offsetY,
            startAngle: startAngle,
            endAngle: endAngle,
            circumference: circumference,
            outerRadius: outerRadius,
            innerRadius: innerRadius,
            label: valueAtIndexOrDefault(dataset.label, index, chart.data.labels[index]),
          },

          draw: function () {
            const ctx = this._chart.ctx,
            vm = this._view,
            sA = vm.startAngle,
            eA = vm.endAngle,
            opts = this._chart.config.options;

            const labelPos = this.tooltipPosition();
            const segmentLabel = vm.circumference / opts.circumference * 100;

            ctx.beginPath();

            ctx.arc(vm.x, vm.y, vm.outerRadius, sA, eA);
            ctx.arc(vm.x, vm.y, vm.innerRadius, eA, sA, true);

            ctx.closePath();
            ctx.strokeStyle = vm.borderColor;
            ctx.lineWidth = vm.borderWidth;

            ctx.fillStyle = vm.backgroundColor;

            ctx.fill();
            ctx.lineJoin = 'bevel';

            if (vm.borderWidth) {
              ctx.stroke();
            }

            if (vm.circumference > 0.0015) { // Trying to hide label when it doesn't fit in segment
              ctx.beginPath();
              ctx.font = helpers.fontString(opts.defaultFontSize, 'regular', opts.defaultFontFamily);
              ctx.fillStyle = '#ffffff';
              ctx.textBaseline = 'baseline';
              ctx.textAlign = 'center';

              // Round percentage in a way that it always adds up to 100%
              ctx.fillText(segmentLabel.toFixed(0) + '%', labelPos.x, labelPos.y);


              // display in the center the total sum of all segments
              const total = Math.round((dataset.data.reduce((sum, val) => sum + val, 0) + Number.EPSILON) * 100) / 100;
              ctx.fillStyle = '#190707';
              ctx.font = helpers.fontString(opts.defaultFontSize , opts.defaultFontStyle, opts.defaultFontFamily);
              const formattedTotal = opts.custom.uom_type === 'minutes' ? secondsConvert(total) :
              opts.custom.uom_type === 'seconds' ? secondsConvert(total) : total;
              ctx.fillText(formattedTotal, vm.x, vm.y - 10, 200);
              ctx.font = helpers.fontString(opts.defaultFontSize, opts.defaultFontStyle, opts.defaultFontFamily);
              if (opts.custom.text1) { ctx.fillText(opts.custom.text1, vm.x, vm.y + 4, 200); }
              if (opts.custom.text2) { ctx.fillText(opts.custom.text2, vm.x, vm.y + 16, 200); }
            }
          },
        });

        const model = arc._model;
        model.backgroundColor = custom.backgroundColor ? custom.backgroundColor :
          valueAtIndexOrDefault(dataset.backgroundColor, index, arcOpts.backgroundColor);
        model.hoverBackgroundColor = custom.hoverBackgroundColor ? custom.hoverBackgroundColor :
          valueAtIndexOrDefault(dataset.hoverBackgroundColor, index, arcOpts.hoverBackgroundColor);
        model.borderWidth = custom.borderWidth ? custom.borderWidth :
          valueAtIndexOrDefault(dataset.borderWidth, index, arcOpts.borderWidth);
        model.borderColor = custom.borderColor ? custom.borderColor :
          valueAtIndexOrDefault(dataset.borderColor, index, arcOpts.borderColor);

        // Set correct angles if not resetting
        if (!reset || !animationOpts.animateRotate) {
          if (index === 0) {
            model.startAngle = opts.rotation;
          } else {
            model.startAngle = self.getMeta().data[index - 1]._model.endAngle;
          }

          model.endAngle = model.startAngle + model.circumference;
        }

        arc.pivot();
      },
    });
  }


  createRoundedBarChart(){

    Chart['elements'].Rectangle.prototype.draw = function() {

      let ctx = this._chart.ctx;
      let view = this._view;

      //////////////////// edit this to change how rounded the edges are /////////////////////
      let borderRadius = 12;


      let left = view.x - view.width / 2;
      let right = view.x + view.width / 2;
      let top = view.y;
      let bottom = view.base;

      ctx.beginPath();
      ctx.fillStyle = view.backgroundColor;
      ctx.strokeStyle = view.borderColor;
      ctx.lineWidth = view.borderWidth;

      let barCorners = [
          [left, bottom],
          [left, top],
          [right, top],
          [right, bottom]
      ];

      //start in bottom-left
      ctx.moveTo(barCorners[0][0], barCorners[0][1]);

      for (let i = 1; i < 4; i++) {
          let x = barCorners[1][0];
          let y = barCorners[1][1];
          let width = barCorners[2][0] - barCorners[1][0];
          let height = barCorners[0][1] - barCorners[1][1];


          //Fix radius being too big for small values
          if(borderRadius > width/2){
              borderRadius = width/2;
          }
          if(borderRadius > height/2){
              borderRadius = height/2;
          }



          // DRAW THE LINES THAT WILL BE FILLED - REPLACING lineTo with quadraticCurveTo CAUSES MORE EDGES TO BECOME ROUNDED
          ctx.moveTo(x + borderRadius, y);
          ctx.lineTo(x + width - borderRadius, y);
          ctx.quadraticCurveTo(x + width, y, x + width, y + borderRadius);
          ctx.lineTo(x + width, y + height - borderRadius);
          ctx.lineTo(x + width, y + height, x + width - borderRadius, y + height);
          ctx.lineTo(x + borderRadius, y + height);
          ctx.lineTo(x, y + height, x, y + height - borderRadius);
          ctx.lineTo(x, y + borderRadius);
          ctx.quadraticCurveTo(x, y, x + borderRadius, y);

      }
      //FILL THE LINES
      ctx.fill();
    };

  }


  createPieWithLabels() {
    Chart.defaults.pieWithLabels = Chart.helpers.clone(Chart.defaults.doughnut);
    const helpers = Chart.helpers;
    Chart.controllers.pieWithLabels = Chart.controllers.doughnut.extend({
      updateElement: function(arc, index, reset) {
        const self = this;
        const chart = self.chart,
          chartArea = chart.chartArea,
          opts = chart.options,
          animationOpts = opts.animation,
          arcOpts = opts.elements.arc,
          centerX = (chartArea.left + chartArea.right) / 2,
          centerY = (chartArea.top + chartArea.bottom) / 2,
          startAngle = opts.rotation, // non reset case handled later
          endAngle = opts.rotation, // non reset case handled later
          dataset = self.getDataset(),
          circumference = reset && animationOpts.animateRotate
            ? 0 : arc.hidden
            ? 0 : self.calculateCircumference(dataset.data[index]) * (opts.circumference / (2.0 * Math.PI)),
          innerRadius = reset && animationOpts.animateScale ? 0 : self.innerRadius,
          outerRadius = reset && animationOpts.animateScale ? 0 : self.outerRadius,
          custom = arc.custom || {},
          valueAtIndexOrDefault = helpers.getValueAtIndexOrDefault;

        /**
         * CUSTOM LEGEND
         */
        let value = dataset.data[index];
        if (opts.custom.uom_type === 'minutes') {
          const pipe = new DatePipe('en-US');

          value = pipe.transform(value * 1000 * 60, 'HH:mm');
        }
        if(chart.legend.legendItems[index]) {
          chart.legend.legendItems[index].text = chart.data.labels[index] + ' ' + value; // legend text
        }
        chart.legend.options.labels.generateLabels(chart);

        helpers.extend(arc, {
          // Utility
          _datasetIndex: self.index,
          _index: index,

          // Desired view properties
          _model: {
            x: centerX + chart.offsetX,
            y: centerY + chart.offsetY,
            startAngle: startAngle,
            endAngle: endAngle,
            circumference: circumference,
            outerRadius: outerRadius,
            innerRadius: innerRadius,
            label: valueAtIndexOrDefault(dataset.label, index, chart.data.labels[index]),
          },

          draw: function () {
            const ctx = this._chart.ctx,
            vm = this._view,
            sA = vm.startAngle,
            eA = vm.endAngle,
            opts = this._chart.config.options;

            const labelPos = this.tooltipPosition();
            const segmentLabel = vm.circumference / opts.circumference * 100;

            ctx.beginPath();

            ctx.arc(vm.x, vm.y, vm.outerRadius, sA, eA);
            ctx.arc(vm.x, vm.y, vm.innerRadius, eA, sA, true);

            ctx.closePath();
            ctx.strokeStyle = vm.borderColor;
            ctx.lineWidth = vm.borderWidth;

            ctx.fillStyle = vm.backgroundColor;

            ctx.fill();
            ctx.lineJoin = 'bevel';

            if (vm.borderWidth) {
              ctx.stroke();
            }

            if (vm.circumference > 0.0015) { // Trying to hide label when it doesn't fit in segment
              ctx.beginPath();
              ctx.font = helpers.fontString(opts.defaultFontSize, 'regular', opts.defaultFontFamily);
              ctx.fillStyle = '#ffffff';
              ctx.textBaseline = 'baseline';
              ctx.textAlign = 'center';

              // Round percentage in a way that it always adds up to 100%
              const aP = eA-sA;
              const xP = 50 * Math.cos(aP);
              const yP = 50 * Math.sin(aP);
              // ctx.fillText(segmentLabel.toFixed(0) + '%', xP, yP);
              ctx.fillText(segmentLabel.toFixed(0) + '%', labelPos.x, labelPos.y);
            }
          },
        });

        const model = arc._model;
        model.backgroundColor = custom.backgroundColor ? custom.backgroundColor :
          valueAtIndexOrDefault(dataset.backgroundColor, index, arcOpts.backgroundColor);
        model.hoverBackgroundColor = custom.hoverBackgroundColor ? custom.hoverBackgroundColor :
          valueAtIndexOrDefault(dataset.hoverBackgroundColor, index, arcOpts.hoverBackgroundColor);
        model.borderWidth = custom.borderWidth ? custom.borderWidth :
          valueAtIndexOrDefault(dataset.borderWidth, index, arcOpts.borderWidth);
        model.borderColor = custom.borderColor ? custom.borderColor :
          valueAtIndexOrDefault(dataset.borderColor, index, arcOpts.borderColor);

        // Set correct angles if not resetting
        if (!reset || !animationOpts.animateRotate) {
          if (index === 0) {
            model.startAngle = opts.rotation;
          } else {
            model.startAngle = self.getMeta().data[index - 1]._model.endAngle;
          }

          model.endAngle = model.startAngle + model.circumference;
        }

        arc.pivot();
      },
    });
  }
}
