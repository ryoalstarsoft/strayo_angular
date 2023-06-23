import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
  selector: 'app-new-annotation-form',
  templateUrl: './new-annotation-form.component.html',
  styleUrls: ['./new-annotation-form.component.css']
})
export class NewAnnotationFormComponent implements OnInit {
  public name: string;
  public notes: string;
  @Output() submit: EventEmitter<any> = new EventEmitter();
  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit() {
  }

  onSubmit() {
    this.submit.emit({name: this.name, notes: this.notes});
    this.bsModalRef.hide();
  }

}