// JQUERY INIT
// JQUERY INIT

$(function () {
    var ajaxResponseBaseTime = 1;
    var ajaxResponseRequestError = "<div class='message error icon-warning'>Desculpe mas não foi possível processar sua requisição...</div>";

    $('form').trigger("reset");

    $(".social_share_ellox").jsSocials({
        shareIn: "popup",
        showLabel: false,
        showCount: false,
        shares: ["facebook", "linkedin", "whatsapp", "telegram"]
    });

    //FORMS
    $("form:not('.ajax_off')").submit(function (e) {
        e.preventDefault();

        var form = $(this);
        var load = $(".ajax_load");
        var flashClass = "ajax_response";
        var flash = $("." + flashClass);

        if (typeof tinyMCE !== 'undefined') {
            tinyMCE.triggerSave();
        }

        form.ajaxSubmit({
            url: form.attr("action"),
            type: "POST",
            dataType: "json",
            beforeSend: function () {
                load.fadeIn(200).css("display", "flex");
            },
            uploadProgress: function (event, position, total, completed) {
                var loaded = completed;
                var load_title = $(".ajax_load_box_title");
                load_title.text("Enviando (" + loaded + "%)");

                if (completed >= 100) {
                    load_title.text("Aguarde, carregando...");
                }
            },
            success: function (response) {
                //redirect
                if (response.redirect) {
                    window.location.href = response.redirect;
                } else {
                    form.find("input[type='file']").val(null);
                    load.fadeOut(200);
                }

                //reload
                if (response.reload) {
                    window.location.reload();
                } else {
                    load.fadeOut(200);
                }

                //message
                if (response.message) {
                    ajaxMessage(response.message, ajaxResponseBaseTime);
                    load.fadeOut(200);
                }

                if (response.messagedesk) {
                    if (flash.length) {
                        flash.html(response.messagedesk).fadeIn(100).effect("bounce", 300);
                    } else {
                        form.prepend("<div class='" + flashClass + "'>" + response.messagedesk + "</div>")
                            .find("." + flashClass).effect("bounce", 300);
                    }
                }

                //text
                if (response.html) {
                    $('.' + response.html[0]).html(response.html[1]);
                }

                //text
                if (response.html2) {
                    $('.' + response.html2[0]).html(response.html2[1]);
                }

                if (response.closeModal) {
                    $(response.closeModal).fadeOut();
                }

                if (response.chat) {
                    var list = "";
                    var chatAppScroll;

                    $.each(response.chat, function (item, data) {
                        list += mensageHtmlUsuario(data.foto, data.nome, data.hora, data.mensagem, data.class);
                    });

                    $(".mensagens").html(list);
                    $(".j_mensagem").val("");

                    $(".scroll").each(function () {
                        if ($(this).parents(".chat-app").length > 0) {
                            chatAppScroll = new PerfectScrollbar($(this)[0]);
                            $(".chat-app .scroll").scrollTop(
                                $(".chat-app .scroll").prop("scrollHeight")
                            );
                            chatAppScroll.update();
                            return;
                        }
                        var ps = new PerfectScrollbar($(this)[0]);
                    });
                }

                //image by fsphp mce upload
                if (response.mce_image) {
                    $('.mce_upload').fadeOut(200);
                    tinyMCE.activeEditor.insertContent(response.mce_image);
                }
            },
            complete: function () {
                if (form.data("reset") === true) {
                    form.trigger("reset");
                }
            },
            error: function () {
                load.fadeOut();
                ajaxMessage(ajaxResponseRequestError, 5);
            }
        });
    });

    // AJAX RESPONSE

    function ajaxMessage(message, time) {
        var ajaxMessage = $(message);

        ajaxMessage.append("<div class='message_time'></div>");
        ajaxMessage.find(".message_time").animate({ "width": "100%" }, time * 1000, function () {
            $(this).parents(".message").fadeOut(200);
        });

        $(".ajax_response").append(ajaxMessage);
    }

    // AJAX RESPONSE MONITOR

    $(".ajax_response .message").each(function (e, m) {
        ajaxMessage(m, ajaxResponseBaseTime += 1);
    });

    // AJAX MESSAGE CLOSE ON CLICK

    $(".ajax_response").on("click", ".message", function (e) {
        $(this).effect("bounce").fadeOut(1);
    });

    if ($(".ajax_response").length > 0) {
        $.ajax({
            url: $(".ajax_response").data("flash"),
            type: "POST",
            dataType: "json",
            success: function (response) {
                if (response.flash) {
                    ajaxMessage(response.flash, ajaxResponseBaseTime);
                }
            }
        });
    }

    //############## GET CEP
    $('.getCep').change(function () {
        var cep = $(this).val().replace('-', '').replace('.', '');
        if (cep.length === 8) {
            $.get("https://viacep.com.br/ws/" + cep + "/json", function (data) {
                if (!data.erro) {
                    $('.bairro').val(data.bairro);
                    $('.numero').val(data.complemento);
                    $('.cidade').val(data.localidade);
                    $('.endereco').val(data.logradouro);
                    $('.uf').val(data.uf);
                }
            }, 'json');
        }
    });

    // MAK
    $(".mask-date").mask('00/00/0000');
    $(".mask-datetime").mask('00/00/0000 00:00');
    $(".mask-cep").mask('00000-000', { reverse: true });
    $(".mask-time").mask('00:00', { reverse: true });
    $(".mask-month").mask('00/0000', { reverse: true });
    $(".mask-cpf").mask('000.000.000-00');
    $(".mask-cnpj").mask('00.000.000/0000-00', { reverse: true });
    $(".mask-card").mask('0000  0000  0000  0000', { reverse: true });
    $(".mask-money").mask('000.000.000.000.000,00', { reverse: true, placeholder: "R$ 0,00" });
    $(".mask-money-no-placeholder").mask('000.000.000.000.000,00', { reverse: true, placeholder: "0,00" });
    $(".mask-kg").mask('0000.000', { reverse: true, placeholder: "0.000" });
    $(".mask-cm").mask('0000.00', { reverse: true, placeholder: "0.00" });
    $(".mask-markap").mask('0.00', { reverse: true, placeholder: "0.00" });
    $(".mask-porcento").mask('000', { reverse: true, placeholder: "20%" });
    $(".mask-double7").mask('000.0000000', { reverse: true, placeholder: "000.0000000" });

    $('.mask-phone').focusout(function () {
        var phone, element;
        element = $(this);
        element.unmask();
        phone = element.val().replace(/\D/g, '');
        if (phone.length > 10) {
            element.mask("(00) 00000-0000");
        } else {
            element.mask("(00) 0000-00009");
        }
    }).trigger('focusout');

    $(".cpfCnpj").unmask();
    $(".cpfCnpj").focusout(function () {
        $(".cpfCnpj").unmask();
        var tamanho = $(".cpfCnpj").val().replace(/\D/g, '').length;
        if (tamanho == 11) {
            $(".cpfCnpj").mask("999.999.999-99");
        } else if (tamanho == 14) {
            $(".cpfCnpj").mask("99.999.999/9999-99");
        }
    });
    $(".cpfCnpj").focusin(function () {
        $(".cpfCnpj").unmask();
    });

    if (document.getElementById("js_countdown") != null) {
        const date = $("#js_countdown").attr("date");
        var countDownDate = new Date(date).getTime();
        var x = setInterval(function () {
            var now = new Date().getTime();
            var distance = countDownDate - now;

            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);

            document.getElementById("js_countdown").innerHTML = "Aprovação até: " + days + "d " + hours + "h " +
                minutes + "m " + seconds + "s ";

            if (distance < 0) {
                clearInterval(x);
                document.getElementById("js_countdown").innerHTML = "Tempo util expirado!";
            }
        }, 1000);
    }

    //MODAL
    $(".open-form-modal").click(function (e) {
        e.preventDefault();

        var thisModal = $(this).attr("href");
        $(thisModal).fadeIn();
        return false;
    });

    $(".close-form-modal, .overlay-form-modal").click(function () {
        $(".wrap-form-modal").fadeOut();
        return false
    });
});

