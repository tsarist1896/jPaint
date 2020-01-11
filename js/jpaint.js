/**
 * Управляющая функция. Управляет всеми процессами связанными
 * с созданием и работой с изображеним
 * @param {*} g_arr 
 */
function Paint( $block ) { // Динамический прототип
    //свойства
    var _o = this;
    var app = {
        'buttons': {
            'active': 'pencil',
            'img_directory': '/img/buttons/',
        },
        'color': '#000000',
        'size': 20,
        'handler': null,
        'states': {
            'stack': [],
            'current': -1
        }
    };
    var revision = Math.random() * 10000;


    /*
    ***********************************************
    ************  Создаем строку меню  ************
    ***********************************************
    */
    if ( typeof this.clearCanvas != "function" ) {
        Paint.prototype.clearCanvas = function() {
            ctx.clearRect(0, 0, $canvas.width(), $canvas.height());
        }
    }

    var menuBar = {
            'node': null,
            'items': {
                'file': {
                    'node': null,
                    'text': 'Файл',
                    'items': {
                        'open': {
                            'node': null,
                            'text': 'Открыть',
                            'click': function(e) {
                                var $dialog  = $("<div/>", {
                                    'id': 'open_image',
                                    'html': '<img class="loader" src="/img/ajax-loader.gif">'
                                });

                                $.ajax({
                                    'url': '/mngImages.php',
                                    'data': {
                                        'action': 'getImages',
                                    },
                                    'success': function(data, textStatus, jqXHR) {
                                        data = JSON.parse(data);
                                        if(data.ok) {
                                            $dialog.html('');

                                            $.each(data.value, function(index, value) {
                                                var insert_img  = '<label>';
                                                    insert_img +=   '<figure class="img_in_server">';
                                                    insert_img +=     '<img src="'+value.path+'">';
                                                    insert_img +=     '<figcaption>';
                                                    insert_img +=       '<input type="radio" name="server_img" data-width="'+value.width+'" data-height="'+value.height+'" data-path="'+value.path+'" onchange="change_server_img(this)">';
                                                    insert_img +=       value.name;
                                                    insert_img +=     '</figcaption>';
                                                    insert_img +=   '</figure>';
                                                    insert_img += '</label>';

                                                $( insert_img ).appendTo( $dialog );
                                            });

                                            $('<hr>').appendTo( $dialog );

                                            var $local_download_container = $("<div/>").appendTo( $dialog );

                                            var $local_download_input = $("<input>", {
                                                'type': 'file',
                                                'accept': 'image/*',
                                                'css': {
                                                    'position': 'absolute',
                                                    'left': '-9999px',
                                                },
                                                'change': function(e) {
                                                    if( e.target.files.length ) {
                                                        var reader = new FileReader();
                                                        reader.onload = function(theFile) {
                                                            var image = new Image();
                                                            image.onload = function() {
                                                                if( this.src )
                                                                    _o.canvasLoadImg(this.src, this.width, this.height, true);
                                                                else 
                                                                    alert('Изображение не было загружено2');

                                                                e.data = {
                                                                    'local_img': {
                                                                        'base64': this.src,
                                                                        'width': this.width,
                                                                        'height': this.height
                                                                    }
                                                                };

                                                                $dialog.dialog('close');
                                                            };
                                                            image.src = theFile.target.result;
                                                        };
                                                        reader.readAsDataURL( e.target.files[0] );
                                                    }
                                                    else
                                                        alert('Изображение не было загружено');
                                                    
                                                    
                                                }
                                            }).appendTo( $local_download_container );

                                            var $local_download_button = $("<a/>", {
                                                'href': 'javascript:void(0);',
                                                'text': 'Загрузить с компьютера',
                                                'click': function(e) {
                                                    $local_download_input.click();
                                                }
                                            }).appendTo( $local_download_container );
                                        }
                                        else {
                                            if(data.value && typeof data.value == 'string')
                                                $dialog.html('<p style="color: red;">'+data.value+'</p>');
                                            else
                                                $dialog.html('<p style="color: red;">Ошибка!</p>');
                                        }
                                    }
                                });

                                $dialog.dialog({
                                    'modal': true,
                                    'width': 550,
                                    'maxHeight': 450,
                                    'title': 'Загрузить изображение',
                                    'buttons': [
                                        {
                                            'text': 'Загрузить',
                                            'click': function(e) {
                                                var $this = $(this);
                                                var checked_img = $this.find('input[name="server_img"]:checked');
                                                if( checked_img.length ) {
                                                    var path = checked_img.attr('data-path');
                                                    var width = checked_img.attr('data-width');
                                                    var height = checked_img.attr('data-height');

                                                    _o.canvasLoadImg(path, width, height, true);
                                                    $(this).dialog('close');
                                                }
                                                else {
                                                    alert('Изображение не выбрано!');
                                                }
                                            }
                                        },
                                        {
                                            'text': 'Отмена',
                                            'click': function() {
                                                $(this).dialog('close')
                                            }
                                        }
                                    ],
                                    close: function(event, ui) {
                                        $(this).dialog('destroy').remove()
                                    }
                                });
                            }
                        },
                        'save': { // Сохранить
                            'node': null,
                            'text': 'Сохранить',
                            'click': function(e) {
                                var $image_exist = $("<div/>", {
                                    'class': 'image_exist',
                                    'css': {
                                        'margin-top': '1em'
                                    }
                                });
                                
                                var $fileName = $("<input>", {
                                    'type': 'text',
                                    'css': {
                                        'width': '100%'
                                    }
                                });

                                $fileName[0].oninput = function(e) {
                                    var imgname = $(this).val();

                                    if( imgname ) {
                                        $.ajax({
                                            'url': '/mngImages.php',
                                            'type': 'POST',
                                            'data': {
                                                'action': 'checkImageName',
                                                'filename': imgname
                                            },
                                            'success': function(data, textStatus, jqXHR) {
                                                data = JSON.parse(data);
                                                if( data.ok ) {
                                                    if( data.value ) 
                                                        $image_exist.html('Файл с таким именем уже существует!').css({'color': 'red'});
                                                    else {
                                                        $image_exist.html('Название свободно.').css({'color': 'green'});
                                                    } 
                                                }
                                                else
                                                    $image_exist.html('Ошибка').css({'color': 'red'});
                                            },
                                        });
                                    }
                                };

                                var $dialog  = $("<div/>", {
                                    'id': 'save_image',
                                }).append($fileName).append($image_exist);

                                $dialog.dialog({
                                    'modal': true,
                                    'width': 350,
                                    'maxHeight': 350,
                                    'title': 'Сохранить изображение',
                                    'buttons': [
                                        {
                                            'text': 'Сохранить',
                                            'click': function(e) {
                                                $.ajax({
                                                    'url': '/mngImages.php',
                                                    'type': 'POST',
                                                    'data': {
                                                        'action': 'saveImage',
                                                        'filename': $fileName.val(),
                                                        'imgBase64': $canvas[0].toDataURL()
                                                    },
                                                    'success': function(data, textStatus, jqXHR) {
                                                        data = JSON.parse(data);
                                                        $image_exist.html('<p style="color: '+(data.ok ? 'green' : 'red')+';">'+data.value+'</p>');
                                                        $(this).parent().fadeOut("slow").find(this).dialog('close');
                                                    },
                                                });
                                            }
                                        },
                                        {
                                            'text': 'Отмена',
                                            'click': function() {
                                                $(this).dialog('close');
                                            }
                                        }
                                    ],
                                    close: function(event, ui) {
                                        $(this).dialog('destroy').remove();
                                    }
                                });
                            }
                        },
                    }
                },
                'edit': {
                    'node': null,
                    'text': 'Правка',
                    'items': {
                        'undo': { // Отменить
                            'node': null,
                            'id': 'menu_edit_undo',
                            'text': 'Отменить',
                            'click': function(e) {
                                var current = _o.prevState();
                            }
                        },
                        'redo': { // Вернуть
                            'node': null,
                            'id': 'menu_edit_redo',
                            'text': 'Вернуть',
                            'click': function(e) {
                                var current = _o.nextState();
                            }
                        },
                    }
                },
                'canvas': {
                    'node': null,
                    'text': 'Холст',
                    'items': {
                        'resize': { // Отменить
                            'node': null,
                            'text': 'Изменить размер',
                            'click': function(e) {
                                var html = '<p>Ширина: <input type="number" id="change_canvas_width" min="1" max="2500" value="480"></p>';
                                    html += '<p>Высота: <input type="number" id="change_canvas_height" min="1" max="2500" value="480"></p>'
                                var $dialog  = $("<div/>", {
                                    'id': 'resize_canvas',
                                    'html': html
                                });
                                $dialog.dialog({
                                    'modal': true,
                                    'title': 'Изменение размера холста',
                                    'buttons': [
                                        {
                                            'text': 'OK',
                                            'click': function() {
                                                var width = $('#change_canvas_width').val();
                                                var height = $('#change_canvas_height').val();
                                                var imgBase64 = $canvas[0].toDataURL();
                                                _o.canvasLoadImg(imgBase64, width, height, true);
                                                $(this).dialog('close')
                                            }
                                        },
                                        {
                                            'text': 'Отмена',
                                            'click': function() {
                                                $(this).dialog('close')
                                            }
                                        }
                                    ],
                                    close: function(event, ui) {
                                        $(this).dialog('destroy').remove()
                                    }
                                });
                            }
                        },
                        'clear': { // Вернуть
                            'node': null,
                            'text': 'Очистить',
                            'click': function(e) {
                                if( confirm('Вы действительно хотите очистить холст?') ) {
                                    _o.clearCanvas();
                                    _o.registerState()
                                }
                            }
                        },
                    }
                }
            }
    }

    menuBar.node = $("<ul/>", {
        'class': 'menu_bar',
    });

    $.each(menuBar.items, function(menu, params) {
        params.node = $("<li/>", {
            'class': 'menu_bar_item '+menu,
            'html': '<a href="javascript:void(0);">'+params.text+'</a>',
        }).appendTo( menuBar.node );

        if( params.items ) {
            var subitem = $("<ul/>", {
                'class': 'menu_bar_subitems menu_bar_drop_down',
            }).appendTo( params.node );

            $.each(params.items, function(menu2, params2) {
                var elemParams2 = {
                    'class': 'menu_bar_subitem '+menu2,
                    'html': '<a href="javascript:void(0);">'+params2.text+'</a>',
                };

                if( params2.id )
                    elemParams2.id = params2.id;

                if( params2.click )
                    elemParams2.click = params2.click;

                params2.node = $("<li/>", elemParams2).appendTo( subitem );
            });
        }
    });

    menuBar.node.appendTo( $block );


    /*
    ***********************************************
    ******* Создаем верхний sidebar (цвет) ********
    ***********************************************
    */
    var colorSidebar = {
        'node' : null,
        'curent_color': {
            'node': null,
            'input': {
                'node': null
            },
            'value': app.color,
        },
        'colors': [
            '#000000', '#827F82', '#810000', '#7E8100', '#018001', '#008180', '#010180', '#810180', '#81803F', '#014140', '#0380FE', '#014081', '#7F01FD', '#823F00',
            '#ffffff', '#C2BFC0', '#FD0000', '#FFFF02', '#02FF01', '#01FFFF', '#0000FD', '#FF00FE', '#FDFF7F', '#01FE80', '#81FEFF', '#817FFF', '#FE017D', '#FE8040',
        ],
        'first_line' : {
            'node' : null,
        },
        'second_line' : {
            'node' : null,
        },
        'alpha': {
            'node' : null,
        }
    };




    if ( typeof this.setAlpha != "function" ) {
        Paint.prototype.setAlpha = function(alpha) {
            if( typeof alpha != 'undefined' ) {
                if( alpha < 0 ) {
                    colorSidebar.alpha.node.val(0);
                    colorSidebar.alpha.node.attr('value', 0);
                    colorSidebar.alpha.node.attr('title', 0);
                }
                else if( alpha > 1 ) {
                    colorSidebar.alpha.node.val(1);
                    colorSidebar.alpha.node.attr('value', 1);
                    colorSidebar.alpha.node.attr('title', 0);
                }
                else {
                    colorSidebar.alpha.node.val(alpha);
                    colorSidebar.alpha.node.attr('value', alpha);
                    colorSidebar.alpha.node.attr('title', alpha);
                }
            }
        }
    }


    if ( typeof this.getAlpha != "function" ) {
        Paint.prototype.getAlpha = function() {
            return colorSidebar.alpha.node.val();
        }
    }


    if ( typeof this.setColor != "function" ) {
        Paint.prototype.setColor = function(value, alpha) {
            colorSidebar.curent_color.node.css('background-color', value);
            app.color = colorSidebar.curent_color.value = value;
            colorSidebar.curent_color.input.node.val( value );

            if(typeof alpha != 'undefined')
                this.setAlpha( (parseFloat(alpha)).toFixed(2) );
        }
    }


    /**
     * 
     */
    if ( typeof this.handlerSetColor != "function" ) {
        Paint.prototype.handlerSetColor = function(e) {
            var color = $( this ).attr('data-color');
            _o.setColor( color );
        }
    }

    colorSidebar.node = $("<div/>", {
        'class': 'color_sidebar',
    });

    colorSidebar.curent_color.node = $("<div/>", {
        'class': 'color_sidebar_current_value',
        'css': {
            'background-color': colorSidebar.curent_color.value
        }
    }).appendTo( colorSidebar.node );

    colorSidebar.curent_color.input.node = $('<input type="color">',{
        'type': 'color',
    }).insertAfter( colorSidebar.curent_color.node );

    colorSidebar.curent_color.node.click(function(e) {
        colorSidebar.curent_color.input.node.trigger('click');
    });

    colorSidebar.curent_color.input.node.change(function(e) {
        _o.setColor( $(this).val() );
    });


    colorSidebar.first_line.node = $("<ul/>", {
        'class': 'color_sidebar_colors color_sidebar_first_line',
    }).appendTo( colorSidebar.node );

    colorSidebar.second_line.node = $("<ul/>", {
        'class': 'color_sidebar_colors color_sidebar_second_line',
    }).appendTo( colorSidebar.node );

    var breakColor = colorSidebar.colors.length / 2;
    for(var i=0; i < colorSidebar.colors.length; i++) {
        var elem = $("<li/>", {
            'class': 'color_sidebar_value',
            'css': {
                'background-color': colorSidebar.colors[i]
            },
            'data-color': colorSidebar.colors[i],
            'click': this.handlerSetColor
        });

        if(breakColor > i)
            elem.appendTo( colorSidebar.first_line.node );
        else
            elem.appendTo( colorSidebar.second_line.node );
    }

    colorSidebar.alpha.node = $('<input>',{
        'type': 'range',
        'min': 0,
        'max': 1,
        'step': 0.01,
        'value': 1,
        'change': function(e) {
            var $this = $(this);
            var value = $this.val();
            _o.setAlpha(value);
        },
    }).appendTo( colorSidebar.node );

    colorSidebar.node.appendTo( $block );



/*
    ***********************************************
    ************** Блок инструментов **************
    ***********************************************
    */
    var tools = { };

    var $settingsPanel = $("<div/>", {
        'class': 'settings_panel',
    }).appendTo( $block ); // Панель настроек

    var $leftSidebar = $("<ul/>", {
        'class': 'left_sidebar',
    }).appendTo( $block );


    /*
    ***********************************************
    ************ Создаем левый sidebar ************
    ***********************************************
    */
    tools.sampling = {
        'button': {
            'node' : null,
            'img': 'sampling.png',
            'title': 'Выбор цвета',
        }
    };
    tools.eraser = {
        'button': {
            'node' : null,
            'img': 'eraser.png',
            'title': 'Ластик',
        }
    };
    tools.pencil = {
        'button': {
            'node' : null,
            'img': 'pencil.png',
            'title': 'Карандаш',
        }
    };


    /**
     * Обработчик нажатия на кнопки левого sidebar
     */
    if ( typeof this.clickOnButtonTools != "function" ) {
        Paint.prototype.clickOnButtonTools = function(e) {
            $.each(tools, function(index, value) {
                value.button.node.removeClass('active');
                if(value.settings && value.settings.node) {
                    value.settings.node.removeClass('active');
                }
            });

            var $this = $(this);
            var type = $this.attr('data-type');
            if( type && tools[type] ) {
                if( tools[type].handler )
                    app.handler = tools[type].handler;
                else
                    app.handler = null;

                if( tools[type].settings ) 
                    tools[type].settings.node.addClass('active');
            }

            $this.addClass('active');
        };
    }


    // Вставляем кнопки
    $.each(tools, function(index, value) {
        var button = value.button;
        button.node = $("<li/>", {
            'class': 'ls_button_'+index+(index === app.buttons.active ? ' active' : ''),
            'css': {
                'background-image': "url('"+app.buttons.img_directory + button.img+"')",
            },
            'title': button.title,
            'data-type': index,
            'click': Paint.prototype.clickOnButtonTools,
        }).appendTo( $leftSidebar );
    });




    /*
    ***********************************************
    ********** Заполняем панель настроек **********
    ***********************************************
    */
    tools.pencil.settings = {
        'node': null,
        'items': {
            'size': {
                'node': null,
                'text': 'Размер: ',
                'value': app.size,
                'input': {
                    'node': null,
                    'type': 'number',
                    'max': 255,
                    'min': 1,
                    'value': app.size,
                    'handlers': {
                        'change': function(e) {
                            tools.pencil.settings.items.size.value = this.value;
                        },
                        'mouseout': function(e) {
                            tools.eraser.settings.items.size.value = this.value;
                        },
                    }
                },
            }
        }
    };
    tools.eraser.settings = {
        'node': null,
        'items': {
            'size': {
                'node': null,
                'text': 'Размер: ',
                'value': app.size,
                'input': {
                    'node': null,
                    'type': 'number',
                    'max': 255,
                    'min': 1,
                    'value': app.size,
                    'handlers': {
                        'change': function(e) {
                            tools.eraser.settings.items.size.value = this.value;
                        },
                        'mouseout': function(e) {
                            tools.eraser.settings.items.size.value = this.value;
                        },
                    }
                },
            }
        }
    };

    $.each(tools, function(toolName, tool) {
        if( tool.settings ) {
            var settings = tool.settings;
            settings.node = $("<div/>", {
                'class': 'settings_item setting_'+toolName+(toolName === app.buttons.active ? ' active' : ''),
            }).appendTo( $settingsPanel );

            if( settings.items ) {
                
                $.each(settings.items, function(settName, sett) {
                    var input = sett.input;

                    sett.node = $("<div>", {
                        'type': input.type,
                        'class': 'settings_'+toolName+'_'+settName,
                    }).appendTo( settings.node );

                    sett.node.append( sett.text );

                    var inputParams = {};
                    if( input.type )
                        inputParams.type = input.type;
                    if( input.min )
                        inputParams.min = input.min;
                    if( input.max )
                        inputParams.max = input.max;
                    if( input.value )
                        inputParams.value = input.value;
                    if( input.handlers ) {
                        if( input.handlers.change && typeof input.handlers.change == 'function' )
                            inputParams.change = input.handlers.change;

                        if( input.handlers.mouseout && typeof input.handlers.mouseout == 'function' )
                            inputParams.mouseout = input.handlers.mouseout;
                    }

                    input.node = $("<input>", inputParams).appendTo( sett.node );
                });
            }
        }
    });



    /*
    ***********************************************
    *********** Создаем область canvas ************
    ***********************************************
    */
    var canvas = {
        'node' : null,
        'iframe': {
            'node' : null,
            'width': 450,
            'height': 450
        },
    };
    canvas.node = $("<div/>", {
        'class': 'paint_canvas',
    });

    canvas.iframe.node = $("<iframe/>", {
        'class': 'paint_canvas_iframe',
    });
    canvas.iframe.node.attr('width', 450);
    canvas.iframe.node.attr('height', 450);

    canvas.iframe.node.appendTo( canvas.node );
    canvas.node.appendTo( $block );


    var $ifr = canvas.iframe.node;
    var $ifr_head = $ifr.contents().find('head');
    var $ifr_body = $ifr.contents().find('body');
    var width  = 450;
    var height = 450;




    tools.pencil.handler = {
        'hasChanges': false,
        'status': false,
        'start': function(e) {
            this.cursorMoved(e.pageX, e.pageY);
            this.status = true;
        },
        'stop': function() {
            this.cursor = [];
            this.status = false;
        },
        'changes': false,
        // Данные курсора
        'cursor': [],
        'cursorMoved': function(x, y) {
            this.cursor.push({
                'x': x,
                'y': y
            });
            
            this.draw();
        },
        'draw': function() {
            ctx.fillStyle = app.color;
            ctx.strokeStyle = app.color;
            try { var size = tools.pencil.settings.items.size.input.node.val(); }
            catch (err) { console.log('%cОшибка!', 'color: red;', err); var size = app.size; }
            
            ctx.lineWidth = 0.1;
            var halfSize = size / 2;
            ctx.beginPath();
            ctx.globalCompositeOperation = 'source-over'; // destination-out
            ctx.globalAlpha = _o.getAlpha();

            if( this.cursor.length > 1 ) {
                var d1 = this.cursor[ this.cursor.length - 1 ];
                var d2 = this.cursor[ this.cursor.length - 2 ];
                var diff_x = d2.x - d1.x;
                var diff_y = d2.y - d1.y;
                var absDiff_x = Math.abs(diff_x);
                var absDiff_y = Math.abs(diff_y);
                var steps = (absDiff_x > absDiff_y) ? absDiff_x : absDiff_y;
                var step_x = diff_x / steps;
                var step_y = diff_y / steps;
                for(var i=0; i < steps; i++) { 
                    ctx.arc((d1.x + i * step_x), (d1.y + i * step_y), halfSize, 0, 2 * Math.PI);
                }
            }
            else {
                var d = this.cursor[ this.cursor.length - 1 ];
                ctx.arc(d.x, d.y, halfSize, 0, 2 * Math.PI);
            }

            this.hasChanges = true;
            ctx.fill();
            // ctx.stroke();
        },
    };

    tools.eraser.handler = {
        'hasChanges': false,
        'status': false,
        'start': function(e) {
            this.cursorMoved(e.pageX, e.pageY);
            this.status = true;
        },
        'stop': function() {
            this.cursor = [];
            this.status = false;
        },
        // Данные курсора
        'cursor': [],
        'cursorMoved': function(x, y) {
            this.cursor.push({
                'x': x,
                'y': y
            });
            this.draw();
        },
        'draw': function() {
            try { var size = tools.eraser.settings.items.size.input.node.val(); }
            catch (err) { console.log('%cОшибка!', 'color: red;', err); var size = app.size; }

            ctx.lineWidth = 0.1;
            var halfSize = size / 2;
            ctx.beginPath();
            ctx.globalCompositeOperation = 'destination-out';
            ctx.globalAlpha = _o.getAlpha();

            if( this.cursor.length > 1 ) {
                var d1 = this.cursor[ this.cursor.length - 2 ];
                var d2 = this.cursor[ this.cursor.length - 1 ];
                var diff_x = d2.x - d1.x;
                var diff_y = d2.y - d1.y;
                var absDiff_x = Math.abs(diff_x);
                var absDiff_y = Math.abs(diff_y);
                var steps = (absDiff_x > absDiff_y) ? absDiff_x : absDiff_y;
                var step_x = diff_x / steps;
                var step_y = diff_y / steps;
                for(var i=0; i < steps; i++) { 
                    ctx.arc((d1.x + i * step_x), (d1.y + i * step_y), halfSize, 0, 2 * Math.PI);
                }
            }
            else {
                var d = this.cursor[ this.cursor.length - 1 ];
                ctx.arc(d.x, d.y, halfSize, 0, 2 * Math.PI);
            }

            this.hasChanges = true;
            ctx.fill();
        },
    };

    tools.sampling.handler = {
        'status': false,
        'start': function(e) {
            this.cursorMoved(e.pageX, e.pageY);
            this.status = true;
            this.draw();
        },
        'stop': function() {
            this.cursor = [];
            this.status = false;
        },
        // Данные курсора
        'cursor': [],
        'cursorMoved': function(x, y) {
            this.cursor.push({
                'x': x,
                'y': y
            });
        },
        'draw': function() {
            var d = this.cursor[ this.cursor.length - 1 ];
            var imageData = ctx.getImageData(d.x, d.y, 1, 1);
            var data = imageData.data;
            var red = data[0].toString(16);
                red = red.length == 2 ? red : ('0'+red);
            var green = data[1].toString(16);
                green = green.length == 2 ? green : ('0'+green);
            var blue = data[2].toString(16);
                blue = blue.length == 2 ? blue : ('0'+blue);
            var color = '#' + red + green + blue;

            var alpha = data[3] / 255;
            _o.setColor(color, alpha );
        },
    };


    // Назначаем текущий обработчик:
    if(app.buttons.active && tools[app.buttons.active] && tools[app.buttons.active].handler) 
        app.handler = tools[app.buttons.active].handler;



    $ifr_head.html('<link type="text/css" href="./styles/iframe.css?'+revision+'" rel="stylesheet">');
    $ifr_body.html('<canvas width="450" height="450">Ваш web-браузер не поддерживает элемент canvas. Обновите браузер.</canvas>');
    var $canvas = $ifr_body.find('canvas');
    


    $canvas.mousemove(function(e){ 
        if( app.handler && app.handler.status ) 
            app.handler.cursorMoved(e.pageX, e.pageY);
    });

    var ctx = $canvas[0].getContext('2d');
    window.cnv = $canvas[0];
    $canvas.css({'border':'1px solid white'});
    $canvas.attr('width', width - 2);
    $canvas.attr('height', height - 2);




    $canvas.mousedown(function(e) {

        if( app.handler && e.buttons == 1 )
            app.handler.start(e); // Начинаем работу обработчика
    });




    
    $canvas.mouseup(function(e) {
        if( app.handler ) {
            app.handler.stop();

            if( app.handler.hasChanges ) {
                ctx.stroke();
                _o.registerState();
                app.handler.hasChanges = false;
            }
        }
    });
    
    $canvas.mouseout(function(e) {
        if( app.handler ) { 
            app.handler.stop();

            if( app.handler.hasChanges ) {
                ctx.stroke();
                _o.registerState();
                app.handler.hasChanges = false;
            }
        }
    });



    if ( typeof this.canvasResize != "function" ) {
        Paint.prototype.canvasResize = function(width, height) {
            $ifr.attr('width', width);
            $canvas.attr('width', width-2);

            $ifr.attr('height', height);
            $canvas.attr('height', height-2);
        };
    }


    if ( typeof this.canvasResizeHandler != "function" ) {
        Paint.prototype.canvasResizeHandler = function(input) {
            var $this = $(this);
            switch( $this.attr('name') ) {
                case 'width':
                    o.width = $this.val();
                    $canvas.width ( o.width - 2 );
                    break;
                case 'height':
                    o.height = $this.val();
                    $canvas.height ( o.height - 2 );
                    break;
            }
        };
    }

    if ( typeof this.canvasLoadImg != "function" ) {
        Paint.prototype.canvasLoadImg = function(src, width, height, registerState) {
            var img = new Image();
            img.src = src;

            if(width && height)
                _o.canvasResize(width, height);
            
            img.onload = function() {
                ctx.drawImage(img, 0, 0);

                if( registerState )
                    _o.registerState();
            };
        };
    }




    // *************** Управление состояниями *************
    if ( typeof this.deleteStateFrom != "function" ) {
        Paint.prototype.deleteStateFrom = function(from) {
            var length = app.states.stack.length;
            if( 0 <= from && from < length ) {
                app.states.stack.length = from;

                if( app.states.current >= from )
                    app.states.current = from - 1;
                
                return true;
            }
            else
                return false;
        };
    }

    if ( typeof this.insertState != "function" ) {
        Paint.prototype.insertState = function() {
            imgBase64 = $canvas[0].toDataURL();
            var current = app.states.stack.length - 1;

            if(app.states.stack.length == 0 || app.states.stack[current] !== imgBase64) {
                app.states.stack.push(imgBase64);
                app.states.current = app.states.stack.length - 1;
            }
        };
    }

    if ( typeof this.returnState != "function" ) {
        Paint.prototype.returnState = function(stNum) {
            var length = app.states.stack.length;
            if( 0 <= stNum && stNum < length ) {
                return app.states.stack[ stNum ];
            }
            else
                return false;
        };
    }

    if ( typeof this.prevState != "function" ) {
        Paint.prototype.prevState = function() {
            var current = app.states.current;

            if( current > 0) {
                var newCurrent = current - 1;
                var imgBase64 = this.returnState(newCurrent);
                var image = new Image();
                image.onload = function() {
                    if( this.src ) {
                        _o.canvasLoadImg(this.src, this.width, this.height);
                        app.states.current = newCurrent;
                    }
                    else 
                        alert('Изменения не были произведены');
                };
                image.src = imgBase64;

                return newCurrent;
            }
            else {
                return false;
            }
        };
    }

    if ( typeof this.nextState != "function" ) {
        Paint.prototype.nextState = function() {
            var current = app.states.current;
            var length = app.states.stack.length;

            if( current < (length-1) ) {
                var newCurrent = current + 1;
                var imgBase64 = this.returnState(newCurrent);
                var image = new Image();
                image.onload = function() {
                    if( this.src ) {
                        _o.canvasLoadImg(this.src, this.width, this.height);
                        app.states.current = newCurrent;
                    }
                    else 
                        alert('Изменения не были произведены');
                };
                image.src = imgBase64;

                return newCurrent;
            }
            else {
                return false;
            }
                
        };
    }

    if ( typeof this.registerState != "function" ) {
        Paint.prototype.registerState = function() {
            var current = app.states.current;
            var length = app.states.stack.length;

            if( current > 0 && current < (length-1) )
                this.deleteStateFrom(current + 1);
            
            this.insertState();
        };

        this.registerState(); // Регестрируем первое состояние
    }
}



function change_server_img(t) {
    $img_in_server = $('.img_in_server');
    $.each($img_in_server, function(index, value) {
        $(value).removeClass('active');
    });

    $(t).parent().parent().addClass('active');
}