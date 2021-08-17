import { Component, OnInit } from '@angular/core';
import {ActivitiesService} from "../activities.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss']
})
export class SettingsPageComponent implements OnInit {

  constructor(
    private activitiesService: ActivitiesService,
    private matSnackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
  }

  clearTodayResult() {
    this.activitiesService.clearTodayScorings();
  }

  exportData() {
    let data = this.activitiesService.getRawData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    document.body.appendChild(a);
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = 'Данные improveMe.json'
    a.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 0);

  }

  importData() {
    let input = document.createElement('input');
    input.type = 'file';
    input.click();

    input.onchange = (e) => {

      // getting a hold of the file reference
      let file = (e as any).target.files[0];

      // setting up the reader
      let reader = new FileReader();
      reader.readAsText(file,'UTF-8');

      // here we tell the reader what to do when it's done reading...
      reader.onload = (readerEvent) => {
        let content = readerEvent.target?.result; // this is the content!
        input.remove();
        try {
          this.activitiesService.saveRawData(JSON.parse(content as string));
        } catch (e) {
          this.matSnackBar.open('Возникла ошибка при импорте данных, проверьте импортируемый файл еще раз или свяжитесь с разработчиком');
        }
      };
    }
  }
}
