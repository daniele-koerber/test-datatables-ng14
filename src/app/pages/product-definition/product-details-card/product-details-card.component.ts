import { Component, Input, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import { ConfigService } from '../../../@core/utils/services/config.service';

@Component({
  selector: 'ngx-product-details-card',
  styleUrls: ['./product-details-card.component.scss'],
  templateUrl: './product-details-card.component.html',
})

export class ProductDetailsCardComponent implements OnChanges {

  @Input() readonly;
  @Input() uniqueValues: boolean = false;
  @Input() definition: any;
  @Input() definitions: any;
  @Input() row: any;
  @Input() processCell: any;
  @Output() emitChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() setButtonState: EventEmitter<any> = new EventEmitter<boolean>();
  lang;

  productionCodeError = false;
  translatedNew

  constructor(
    public translate: TranslateService,
    private config: ConfigService,
  ) {
    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    this.lang = config.getSelectedLanguage();
    translate.use(this.lang);
    this.translate.get(["COMMON.New"]).subscribe(translations => {
      this.translatedNew = translations["COMMON.New"];
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.definition?.productCode) {
      this.checkProductionCode(this.definition.productCode);
    }
  }

  updateDefinition (param) {
    this.emitChange.emit(param);
  }

  checkProductionCode(value) {
    const found = this.definitions.find(el => el.productCode === value);
    this.productionCodeError = (found ? true : false);
    this.setButtonState.emit(this.productionCodeError);
  }

}
