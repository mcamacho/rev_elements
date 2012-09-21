(function ($, d, w) {
    var amount, amountxt, rgx = /(.+)(.{3})/, period, rating, interest, monthly, newp, usedp, sc, zipc, radiusc, hasboolean = true;
    sc = d.cookie;
	zipc = sc.indexOf('zipcode') > -1 ? sc.slice(sc.indexOf('zipcode') + 8, sc.indexOf('zipcode') + 13) : '';
	radiusc = sc.indexOf('radius') > -1 ? sc.slice(sc.indexOf('radius') + 7, sc.indexOf(';', sc.indexOf('radius') + 7)) : ''; 
    function update () {
        amount = Number($('#amount').slider('value'));
        amountxt = String(amount);
	if (rgx.test(amountxt)) {
	    amountxt = amountxt.replace(rgx, '$1' + ',' + '$2');
	}
        period = Number($('#period').slider('value'));
        rating = Number($('#rating').slider('value'));
        $('#curr-amount').text(amountxt);
        $('#curr-period').text(period);
        $('#curr-rating').text(rating);
    }
    function hasvehicles (condition) {console.log('hasvehicles');
        var condterm = condition === 'Used' ? usedp : newp;
        var minr = (amount - 2500) > 0? (amount - 2500): 0;
        var maxr = amount + 2500;
        var range = minr + '-' + maxr;
        var caldata = 'json=true&requesttype=count&condition=' + condition + '&' + condterm + '=' + range;
		if(jQuery('#zipcode').val() !== '' && jQuery('#radius').val() !== '') {
			caldata += '&zipcode=' + zipc;
			caldata += '&radius=' + radiusc;
		} 
        $.ajax({
            type: 'POST',
            dataType: 'json',
            data: caldata,
            url: '{THEME_ROOT}/_ajax.php',
            success: function (msg) {
                if (Number(msg.count) > 0) {
                    if (condition === 'New') {
                        $('.newveh').show();
                    } else {
                        $('.preveh').show();
                    }
                } else {
                    if (condition === 'New') {
                        $('.newveh').hide();
                    } else {
                        $('.preveh').hide();
                    }
                }
                if ($('.newveh').css('display') !== 'none' || $('.preveh').css('display') !== 'none') {
                    $('.novehicles').hide();
                } else {
                    $('.novehicles').show();
                }
            }
        });
    }
    function calculate () {
        var x, x1, x2;
        update();
        if (hasboolean) {
          if (typeof(customDrill) !== 'undefined' && customDrill.blocknew) { } else {
            	hasvehicles('New');
        	}
          if (typeof(customDrill) !== 'undefined' && customDrill.blockused) { } else {
            	hasvehicles('Used');
            }
        }
        rating = Number(rating);
        if (rating < 550) {
            interest = 15/1200;
        } else if (rating < 600) {
            interest = 13/1200;
        } else if (rating < 650) {
            interest = 11/1200;
        } else if (rating < 700) {
            interest = 8/1200;
        } else if (rating < 750) {
            interest = 6/1200;
        } else {
            interest = 5/1200;
        }
        monthly = amount * (interest / (1 - Math.pow((1 + interest), -(period * 12))));
        x = String(monthly.toFixed(2)).split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	if (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
        $('#monthly').text(x1 + x2);
    }
    $(d).ready(function () {
    	//get the variable for new and preowned payment values
        newp = $('.payment-calculator .limits').attr('new');
        usedp = $('.payment-calculator .limits').attr('used');
        if (typeof(customDrill) !== 'undefined' && customDrill.blocknew) {
        	$('.newveh').hide();
    	}
        if (typeof(customDrill) !== 'undefined' && customDrill.blockused) {
        	$('.preveh').hide();
        }
        //assign maxv to borrow depending on existance of price
        var maxv = jQuery('.parameter:eq(0) .last').attr('maxv');
        if (maxv.indexOf('price') > -1 || window.location.pathname.indexOf('vehicle') < 0) {
            jQuery('.parameter:eq(0) .last').text('$100,000');
            maxv = '100000';
        } else {
            if (maxv.indexOf(',') < 0 && rgx.test(maxv)) {
                jQuery('.parameter:eq(0) .last').text(maxv.replace(rgx, '$1' + ',' + '$2'));
            }
            maxv.replace(',', '');
        }
        //midv depends on maxv
        var midv = Math.round((Number(maxv) - 1000) / 2);
        //init the sliders
        $('#amount').slider({
            value: midv,
            min: 1000,
            max: maxv,
            step: 1000,
            range: 'min',
            change: function () { hasboolean = true; calculate(); },
            slide: function () {
                $('#curr-amount').text(arguments[1].value);
            }
        });
        $('#period').slider({
            value: 4,
            min: 1,
            max: 7,
            step: 1,
            range: 'min',
            change: function () { hasboolean = false; calculate(); },
            slide: function () {
                $('#curr-period').text(arguments[1].value);
            }
        });
        $('#rating').slider({
            value: 850,
            min: 500,
            max: 850,
            step: 10,
            change: function () { hasboolean = false; calculate(); },
            slide: function () {
                $('#curr-rating').text(arguments[1].value);
            }
        });
        $('a.preveh, a.newveh').click(function (e) {
            e.preventDefault();
            var cond = e.target.className === 'preveh'? 'Used/' + usedp + '=': 'New/' + newp + '=';
            var minr = (amount - 2500) > 0? (amount - 2500): 0;
            var maxr = amount + 2500;
            d.cookie = 'search=; path=/inventory; expires=Thu, 01-Jan-1970 00:00:01 GMT;';
            w.location = '{home}/inventory/' + cond + minr + '-' + maxr;
        });
        // if vehicle single
        var val = $('.preapproved').attr('href');
        if (val) {
            $('a.apply').click(function (e) {
                e.preventDefault();
                $('.preapproved').click();
            });
        } else {
            $('a.apply').hide();
        }
        // trigger the main function
        calculate();
    });
}(jQuery, document, window));