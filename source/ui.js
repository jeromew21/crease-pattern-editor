function nDigitRand(n) {
    return Math.floor(Math.random() * Math.pow(10, n));
}

class MenuAction {
    static html(domId, label) {
        return '<li><a class="dropdown-item" href="#" id="' + domId + '">' + label + '</a></li>'
    }

    constructor(parentId, label, onClick) {
        this.labelText = label;
        this.onClick = onClick;

        var self = this;

        this.domId = "ui-" + label.replaceAll(" ", "-") + nDigitRand(3);
        this.element = $(MenuAction.html(this.domId, this.labelText));

        var parentElement = $("#" + parentId);
        parentElement.append(this.element);
        parentElement.on("click", "#" + this.domId, function (e) {
            self.onClick();
        })
    }
}

class Button {
    static html(domId, label, classes) {
        return '<button type="button" class="' + classes + ' btn btn-outline-secondary" style="margin-right:5px;" id="' + domId + '">' + label + '</button>    ';
    }

    constructor(parentId, classes, label, onClick) {
        this.labelText = label;
        this.onClick = onClick;

        var self = this;

        this.domId = "ui-" + label.replaceAll(" ", "-") + nDigitRand(3);
        this.element = $(Button.html(this.domId, this.labelText, classes));

        var parentElement = $("#" + parentId);
        parentElement.append(this.element);
        parentElement.on("click", "#" + this.domId, function (e) {
            self.onClick();
        })
    }
}

class Checkbox {
    static html(domId, value, label, classes) {
        var checked = " ";
        if (value) {
            checked = " checked ";
        }
        return '<div class="' + classes + '"><label for="'
            + domId
            + '">' + label + '</label>'
            + '<input type="checkbox"' + checked + 'name="' + domId + '" id="' + domId + '" />'
            + '</div>';
    }

    constructor(parentId, classes, label, value, onChange) {
        this.labelText = label + "&nbsp;";
        this.value = value;
        this.onChange = onChange;

        var self = this;

        this.domId = "ui-" + label.replaceAll(" ", "-") + nDigitRand(3);
        this.element = $(Checkbox.html(this.domId, this.value, this.labelText, classes));

        var parentElement = $("#" + parentId);
        parentElement.append(this.element);
        parentElement.on("change", "#" + this.domId, function (e) {
            var val = $(e.target).is(":checked");
            self.value = val;
            self.onChange(val);
        })

        $("#" + this.domId).prop('checked', this.value);
        this.onChange(this.value);
    }

    set(value) {
        this.value = value;
        $("#" + this.domId).prop('checked', value);
    }
}

class SlidingInput {
    static html(domId, value, label, classes, lo, hi) {
        return '<div class="' + classes + '"><label for="'
            + domId
            + '">' + label + '</label>'
            + '<input type="range" min="' + lo + '" max="' + hi + '" value="' + value + '" name="' + domId + '" id="' + domId + '" />'
            + '&nbsp;<span id="' + domId + '-display"></span>'
            + '</div>';
    }

    constructor(parentId, classes, label, value, lo, hi, mul, display, onChange) {
        this.labelText = label + ":&nbsp;";
        this.rawValue = parseInt(value);
        this.actualValue = this.rawValue * mul;
        this.onChange = onChange;
        this.min = lo;
        this.max = hi;
        this.multiplier = mul;
        this.displayFn = display;

        var self = this;

        this.domId = "ui-" + label.replaceAll(" ", "-") + nDigitRand(3);
        this.element = $(SlidingInput.html(this.domId, this.rawValue, this.labelText, classes, this.min, this.max));

        this.displaySelector = "#" + this.domId + "-display";

        var parentElement = $("#" + parentId);
        parentElement.append(this.element);
        parentElement.on("change", "#" + this.domId, function (e) {
            var rawVal = parseInt($(e.target).val())
            var val = rawVal * self.multiplier;
            self.rawValue = rawVal;
            self.actualValue = val;
            self.onChange(val);
            $(self.displaySelector).html(self.displayFn(val))
        })

        $(this.displaySelector).html(self.displayFn(this.actualValue))
        this.onChange(this.actualValue);
    }

    set(value) {
        var val = value / this.multiplier;
        if (val < this.min || val > this.max) { return; }
        this.actualValue = value;
        this.rawValue = val;
        $("#" + this.domId).val(this.rawValue);
        this.onChange(this.actualValue);
        $(this.displaySelector).html(this.displayFn(this.actualValue));
    }
}

class OptionInput {
    static html(domId, value, label, labels, classes) {
        var val = '<div class="' + classes + '"><label for="'
            + domId
            + '">' + label + ':&nbsp;</label>'
            + '<select id="' + domId + '" name="' + domId + '">';

        for (var i = 0; i < labels.length; i++) {
            var selected = "";
            if (labels[i] == value) {
                selected = " selected";
            }

            val += '<option name="' + labels[i] + '"' + selected + '>' + labels[i] + '</option>'
        }

        val = val + '</select>'
            + '</div>';
        return val;
    }

    constructor(parentId, classes, label, labels, value, onChange) {
        this.value = value;
        this.onChange = onChange;
        this.labels = labels;
        this.label = label;

        var self = this;

        this.domId = "ui-" + label.replaceAll(" ", "-") + nDigitRand(3);
        this.element = $(OptionInput.html(this.domId, this.value, this.label, this.labels, classes));

        var parentElement = $("#" + parentId);
        parentElement.append(this.element);
        parentElement.on("change", "#" + this.domId, function (e) {
            var val = $(e.target).val();
            self.value = val;
            self.onChange(val);
        })

        this.onChange(value);
    }

    set(value) {
        this.value = value;
        // $("#" + this.domId).val(value);
    }
}

class StringInput {
    static html(domId, value, label, classes) {
        return '<div class="' + classes + '"><label for="'
            + domId
            + '">' + label + '</label>'
            + '<input type="text" value="' + value + '" name="' + domId + '" id="' + domId + '" />'
            + '</div>';
    }

    constructor(parentId, classes, label, value, onChange) {
        this.labelText = label + ":&nbsp;";
        this.value = value;
        this.onChange = onChange;

        var self = this;

        this.domId = "ui-" + label.replaceAll(" ", "-") + nDigitRand(3);
        this.element = $(StringInput.html(this.domId, this.value, this.labelText, classes));

        var parentElement = $("#" + parentId);
        parentElement.append(this.element);
        parentElement.on("change", "#" + this.domId, function (e) {
            var val = $(e.target).val();
            self.value = val;
            self.onChange(val);
        })

        this.onChange(value);
    }

    set(value) {
        this.value = value;
        $("#" + this.domId).val(value);
    }
}

class NumberInput {
    static html(domId, value, label, classes) {
        return '<div class="' + classes + '"><label for="'
            + domId
            + '">' + label + '</label>'
            + '<input class="number-input" type="number" value="' + value + '" name="' + domId + '" id="' + domId + '" />'
            + '</div>';
    }

    constructor(parentId, classes, label, value, onChange) {
        this.labelText = label + ":&nbsp;";
        this.value = parseInt(value);
        this.onChange = onChange;

        var self = this;

        this.domId = "ui-" + label.replaceAll(" ", "-") + nDigitRand(3);
        this.element = $(NumberInput.html(this.domId, this.value, this.labelText, classes));

        var parentElement = $("#" + parentId);
        parentElement.append(this.element);
        parentElement.on("change", "#" + this.domId, function (e) {
            var val = parseInt($(e.target).val());
            self.value = val;
            self.onChange(val);
        })

        this.onChange(value);

    }
}

class FloatInput {
    static html(domId, value, label, classes, mul, unit) {
        if (mul) {
            mul = ' * <select id="' + domId + '-sel"><option value=1 selected>1</option>';
            var primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
            for (var i = 0; i < 4; i++) {
                mul += "<option value=" + primes[i] + ">&#8730;" + primes[i] + "</option>";
            }

            mul += '</select>';
        } else {
            mul = ""
        }
        return '<div class="' + classes + '"><label for="'
            + domId
            + '">' + label + '</label>'
            + '<input type="text" value="' + value + '" name="' + domId + '" id="' + domId + '" class="number-input" /> ' + unit
            + mul
            + '</div>';
    }

    constructor(parentId, classes, label, value, mul, onChange, unit) {
        this.labelText = label + ":&nbsp;";
        this.value = parseFloat(value);
        this.actualValue = this.value;
        this.onChange = onChange;

        this.multiplier = 1;

        var self = this;

        this.domId = "ui-" + label.replaceAll(" ", "-") + nDigitRand(3);
        this.element = $(FloatInput.html(this.domId, this.value, this.labelText, classes, mul, unit));

        var inputSelector = "#" + this.domId;
        var mulSelector = "#" + this.domId + "-sel";

        var parentElement = $("#" + parentId);
        parentElement.append(this.element);
        parentElement.on("change", inputSelector, function (e) {
            var elemVal = parseFloat($(e.target).val());
            var underlyingValue = elemVal * self.multiplier;
            self.value = elemVal;
            self.actualValue = underlyingValue;
            self.onChange(underlyingValue);
        })

        if (mul) {
            parentElement.on("change", mulSelector, function (e) {
                var val = parseInt($(e.target).val());
                self.multiplier = Math.sqrt(val);

                // actual value stays the same, we just want to change the shown value
                self.value = self.actualValue / self.multiplier;
                $(inputSelector).val(self.value);
            })
        }

        this.onChange(this.actualValue);
    }

    set(value) {
        this.actualValue = parseFloat(value);
        this.value = value / this.multiplier;
        $("#" + this.domId).val(this.value)
    }
}
