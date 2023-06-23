import { Component, OnInit, ViewChild } from '@angular/core';

import { TabsetComponent } from 'ngx-bootstrap';

@Component({
  selector: 'app-annotations-layers',
  templateUrl: './annotations-layers.component.html',
  styleUrls: ['./annotations-layers.component.css']
})
export class AnnotationsLayersComponent implements OnInit {
  @ViewChild('staticTabs') staticTabs: TabsetComponent;
  constructor() { }

  ngOnInit() {
    $('.tabContent').slideDown();
  }

  onTabSwitch() {
    $('.tabContent').slideDown();
  }
}