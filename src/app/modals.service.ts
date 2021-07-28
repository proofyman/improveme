import { Injectable } from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {YesNoDialogComponent} from "./yes-no-dialog/yes-no-dialog.component";

@Injectable({
  providedIn: 'root'
})
export class ModalsService {

  constructor(
    private dialog: MatDialog
  ) { }

  yesNoModal(text: string): Promise<void> {
    let dialogRef = this.dialog.open(YesNoDialogComponent, {
      data: {
        text
      }
    })

    return new Promise((done, fail) => {
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          done(result);
          return;
        }

        fail(result);
      });
    });
  }
}
