import { Injectable } from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {YesNoDialogComponent} from "./yes-no-dialog/yes-no-dialog.component";
import {ComponentType} from "@angular/cdk/overlay";

@Injectable({
  providedIn: 'root'
})
export class ModalsService {

  constructor(
    private dialog: MatDialog
  ) { }

  open(component: ComponentType<unknown>): any {
    let dialogRef = this.dialog.open(component, {
      maxWidth: 500,
      minWidth: '80vw'
    });

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
