import { HttpClient } from "@angular/common/http";
import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { Title } from "@angular/platform-browser";
import {
  ApexChart,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ChartComponent,
} from "ng-apexcharts";
import UserManagment from "../../users/utils/use-managment.abstract";

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart | any;
  responsive: ApexResponsive[];
  colors: any;
  labels: any;
};

@Component({
  selector: "app-chart",
  templateUrl: "./account-details.component.html",
  styleUrls: ["./account-details.component.css"],
})
export class AccountDetailsComponent extends UserManagment implements OnInit {
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions!: Partial<ChartOptions>;

  constructor(
    public override http: HttpClient,
    @Inject("LOCALSTORAGE") public override localStorage: Storage,
    public override titleService: Title
  ) {
    super(http, localStorage, titleService);
  }
  ngOnInit(): void {
    this.initFucntionTOGetUserData().then((res) => {
      let percentage =
        (this.userData.gamesWon / this.userData.gamesPlayed) * 100;
      const series = [percentage, 100 - percentage];
      this.chartOptions = {
        colors: ["#0786fb", "#f7ae1a"],
        series,
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
    });
  }
}
