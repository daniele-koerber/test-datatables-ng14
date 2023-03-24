import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { BrowserModule } from '@angular/platform-browser';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router';

import * as sheredComponents from './components';


import { TabItemDirective } from './components/tab/directives/tab-item.directive';
import { TabsItemsDirective } from './components/tab/directives/tab-items.directive';


@NgModule({
  declarations: [
    sheredComponents.components,
    TabItemDirective,
    TabsItemsDirective
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    // BrowserModule,
    // BrowserAnimationsModule,
    RouterModule,
  ],
  exports: [
    sheredComponents.components,
    TabItemDirective,
    TabsItemsDirective
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AngularKdsLibraryModule { }
