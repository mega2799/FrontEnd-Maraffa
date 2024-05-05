import { Component, ViewChild } from "@angular/core";
import {
  ApexChart,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ChartComponent,
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart | any;
  responsive: ApexResponsive[];
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
      series: [44, 55, 13, 43, 22],
      chart: {
        width: 380,
        type: "pie",
      },
      labels: ["Team A", "Team B", "Team C", "Team D", "Team E"],
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
    };
  }
}
