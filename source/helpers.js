function nDigitRand(n) {
    return Math.floor(Math.random() * Math.pow(10, n));
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

        this.domId = "ui-" + label + nDigitRand(3);
        this.element = $(Checkbox.html(this.domId, this.value, this.labelText, classes));

        var parentElement = $("#" + parentId);
        parentElement.append(this.element);
        parentElement.on("change", "#" + this.domId, function(e) {
            var val = $(e.target).is(":checked");
            self.onChange(val);
        })

        this.onChange(this.value);
    }
}

class NumberInput {
    static html(domId, value, label, classes) {
        return '<div class="' + classes + '"><label for="'
            + domId
            + '">' + label + '</label>'
            + '<input type="number" value="' + value + '" name="' + domId + '" id="' + domId + '" />'
            + '</div>';
    }

    constructor(parentId, classes, label, value, onChange) {
        this.labelText = label + ":&nbsp;";
        this.value = parseInt(value);
        this.onChange = onChange;

        var self = this;

        this.domId = "ui-" + label + nDigitRand(3);
        this.element = $(NumberInput.html(this.domId, this.value, this.labelText, classes));

        var parentElement = $("#" + parentId);
        parentElement.append(this.element);
        parentElement.on("change", "#" + this.domId, function(e) {
            var val = parseInt($(e.target).val());
            self.onChange(val);
        })

        this.onChange(value);

    }
}

class FloatInput {
    static html(domId, value, label, classes) {
        return '<div class="' + classes + '"><label for="'
            + domId
            + '">' + label + '</label>'
            + '<input type="text" value="' + value + '" name="' + domId + '" id="' + domId + '" />'
            + ' * '
            + '<select><option value=1 selected>1</option>'
            + '<option value=2>&#8730; 2</option>'
            + '<option value=3>&#8730; 3</option></select>'
            + '</div>';
    }

    constructor(parentId, classes, label, value, onChange) {
        this.labelText = label + ":&nbsp;";
        this.value = parseFloat(value);
        this.onChange = onChange;

        var self = this;

        this.domId = "ui-" + label + nDigitRand(3);
        this.element = $(FloatInput.html(this.domId, this.value, this.labelText, classes));

        var parentElement = $("#" + parentId);
        parentElement.append(this.element);
        parentElement.on("change", "#" + this.domId, function(e) {
            var val = $(e.target).val();
            self.onChange(val);
        })

        this.onChange(value);

    }
}

var cb1 = new Checkbox("ui-settings", "base", "foo", true, function(value) {
    console.log(value);
});

var fp1 = new FloatInput("ui-settings", "base", "foo1", 0.01, function(value) {
    console.log(value);
})

var n1 = new NumberInput("ui-settings", "base", "bar", 500, function(value) {
    console.log(value);
})