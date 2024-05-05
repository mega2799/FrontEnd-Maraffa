import { Component, ViewChild } from '@angular/core';
// import {
//   ApexNonAxisChartSeries,
//   ApexResponsive,
//   ApexChart,
//   ChartComponent
// } from "apexcharts";

// export type ChartOptions = {
//   series: ApexNonAxisChartSeries;
//   chart: ApexChart;
//   responsive: ApexResponsive[];
//   labels: any;
// };

@Component({
  selector: 'apx-chart',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.css'],
  
})
export class AccountDetailsComponent {
  // @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: any; //Partial<ChartOptions>;

  constructor() {
      this.chartOptions = {
        series: [44, 55, 13, 43, 22],
        chart: {
          width: 380,
          type: "pie"
        },
        labels: ["Team A", "Team B", "Team C", "Team D", "Team E"],
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 200
              },
              legend: {
                position: "bottom"
              }
            }
          }
        ]
      };
    }
  }


