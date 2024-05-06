import { Component, ViewChild } from "@angular/core";
import {
  ApexChart,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ChartComponent,
} from "ng-apexcharts";
import { ColdObservable } from "rxjs/internal/testing/ColdObservable";

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart | any;
  responsive: ApexResponsive[];
  colors : any;
  labels: any;
};

@Component({
  selector: "app-chart",
  templateUrl: "./account-details.component.html",
  styleUrls: ["./account-details.component.css"],
})
export class AccountDetailsComponent {
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  constructor() {
    this.chartOptions = {
      colors:['#0786fb', '#f7ae1a'],
      series: [65, 35],
      chart: {
        width: 380,
        type: "pie",
      },
      labels: ["Partite vinte", "Partite perse"],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
      // colors:["#1abc9c", "#2ecc71"],
    };
  }
}
