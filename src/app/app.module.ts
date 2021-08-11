import {Injectable, NgModule} from '@angular/core';
import {BrowserModule, HAMMER_GESTURE_CONFIG, HammerGestureConfig, HammerModule} from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ActivityListComponent } from './activity-list/activity-list.component';
import { ActivityHistoryComponent } from './activity-history/activity-history.component';
import { CreateActivityShortFormComponent } from './create-activity-short-form/create-activity-short-form.component';
import { ActivityListItemComponent } from './activity-list-item/activity-list-item.component';
import { MainPageComponent } from './main-page/main-page.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatIconModule} from "@angular/material/icon";
import {MatDialogModule} from "@angular/material/dialog";
import { YesNoDialogComponent } from './yes-no-dialog/yes-no-dialog.component';
import { HeaderComponent } from './header/header.component';
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatListModule} from "@angular/material/list";
import { MatDividerModule} from "@angular/material/divider";
import {MatMenuModule} from "@angular/material/menu";
import * as Hammer from 'hammerjs';
import { ScoreNotFromListModalComponent } from './score-not-from-list-modal/score-not-from-list-modal.component';
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatTabsModule} from "@angular/material/tabs";
import { IonicModule } from '@ionic/angular';
import {MatSnackBarModule} from "@angular/material/snack-bar";
import { NavigationPanelComponent } from './navigation-panel/navigation-panel.component';
import { SettingsPageComponent } from './settings-page/settings-page.component';

@Injectable()
export class MyHammerConfig extends HammerGestureConfig {
  overrides = <any>{
    swipe: {direction: Hammer.DIRECTION_ALL},
  }
}

@NgModule({
  declarations: [
    AppComponent,
    ActivityListComponent,
    ActivityHistoryComponent,
    CreateActivityShortFormComponent,
    ActivityListItemComponent,
    MainPageComponent,
    YesNoDialogComponent,
    HeaderComponent,
    ScoreNotFromListModalComponent,
    NavigationPanelComponent,
    SettingsPageComponent
  ],
  imports: [
    MatSnackBarModule,
    MatTabsModule,
    MatCheckboxModule,
    MatMenuModule,
    MatDividerModule,
    MatListModule,
    MatSidenavModule,
    MatDialogModule,
    BrowserModule,
    HammerModule,
    MatIconModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    IonicModule.forRoot()
  ],
  providers: [
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: MyHammerConfig,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
