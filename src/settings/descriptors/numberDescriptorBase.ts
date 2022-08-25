/**
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import {
    IDescriptor,
    IDescriptorParserOptions,
} from "./descriptor";

import { FontSizeDescriptor } from "./autoHiding/fontSizeDescriptor";

import {
    DataRepresentationTypeEnum,
} from "../../dataRepresentation/dataRepresentationType";

import FormattingSettingsSlice = formattingSettings.Slice;

export class NumberDescriptorBase
    extends FontSizeDescriptor
    implements IDescriptor {
;
    public defaultFormat: string = null;
    public columnFormat: string = null;

    public displayUnits: number = 0;

    public density = new formattingSettings.Slider({
        name: "percentile",
        displayName: "Label Density",
        value: 100,
        options: {
            maxValue: {
                type: powerbi.visuals.ValidatorType.Max,
                value: 100,
            }
        }
    });

    format = new formattingSettings.TextInput({
        name: "format",
        displayName: "Format",
        value: null,
        placeholder: ""
    });

    protected minPrecision: number = 0;
    protected maxPrecision: number = 17;
    precision = new formattingSettings.NumUpDown({
        name: "precision",
        displayName: "Decimal Places",
        value: 0,
        options: {
            maxValue: {
                type: powerbi.visuals.ValidatorType.Max,
                value: this.maxPrecision,
            },
            minValue: {
                type: powerbi.visuals.ValidatorType.Min,
                value: this.minPrecision,
            },
        }
    });

    private shouldNumericPropertiesBeHiddenByType: boolean;

    constructor(
        viewport?: powerbi.IViewport, 
        shouldPropertiesBeHiddenByType: boolean = false
    ) {
        super(viewport);

        this.shouldNumericPropertiesBeHiddenByType = shouldPropertiesBeHiddenByType;
    }

    public parse(options: IDescriptorParserOptions) {
        super.parse(options);

        this.hidePropertiesByType(options.type);
    }

    public getFormat(): string {
        return this.format.value || this.columnFormat || this.defaultFormat;
    }

    public setColumnFormat(format: string) {
        if (!format) {
            return;
        }

        this.columnFormat = format;
    }

    public getValueByKey(key: string): string {
        if (key === "format") {
            return this.getFormat();
        }

        return this[key];
    }

    /**
     * Hides properties at the formatting panel
     */
    protected hideNumberProperties(): void {
        Object.defineProperties(this, {
            displayUnits: {
                configurable: true,
                enumerable: false,
            },
            precision: {
                configurable: true,
                enumerable: false,
            },
        });
    }

    protected hideFormatProperty(): void {
        Object.defineProperty(
            this,
            "format", {
                configurable: true,
                enumerable: false,
            },
        );
    }

    protected applyDefaultFormatByType(type: DataRepresentationTypeEnum): void {
        if (this.defaultFormat) {
            return;
        }

        switch (type) {
            case DataRepresentationTypeEnum.DateType: {
                this.defaultFormat = "%M/%d/yyyy";

                if (this.format.value == null) {
                    this.format.value = this.defaultFormat;
                }

                break;
            }
            case DataRepresentationTypeEnum.NumberType: {
                this.defaultFormat = "#,0.00";

                break;
            }
            default: {
                this.defaultFormat = undefined;
            }
        }
    }

    private hidePropertiesByType(type: DataRepresentationTypeEnum = DataRepresentationTypeEnum.NumberType): void {
        this.applyDefaultFormatByType(type);

        if (this.shouldNumericPropertiesBeHiddenByType
            && type !== DataRepresentationTypeEnum.NumberType
        ) {
            this.hideNumberProperties();
        }

        if (!(type === DataRepresentationTypeEnum.NumberType
            || type === DataRepresentationTypeEnum.DateType)
        ) {
            this.hideFormatProperty();
        }
    }
}
