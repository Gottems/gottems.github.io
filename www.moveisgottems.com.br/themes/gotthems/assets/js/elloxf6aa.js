const load = $(".ajax_load");

function ajaxMessage(message, time) {
    var ajaxMessage = $(message);

    ajaxMessage.append("<div class='message_time'></div>");
    ajaxMessage.find(".message_time").animate({ "width": "100%" }, time * 1000, function () {
        $(this).parents(".message").fadeOut(200);
    });

    $(".ajax_response").append(ajaxMessage);
}

$(".ajax_response .message").each(function (e, m) {
    ajaxMessage(m, ajaxResponseBaseTime += 1);
});

$(".ajax_response").on("click", ".message", function (e) {
    $(this).effect("bounce").fadeOut(1);
});


$(".js_proposta").on("click", function (e) {
    e.preventDefault();

    const btn = $(this);
    const uri = btn.data("uri");
    const action = btn.data("action");

    if (action) {
        $.ajax({
            url: action,
            type: "POST",
            data: { uri },
            dataType: "json",
            beforeSend: function () {
                load.fadeIn(200).css("display", "flex");
            },
            success: function (response) {
                if (response.message) {
                    ajaxMessage(response.message, 3);
                    load.fadeOut(200);
                }

                if (response.redirect) {
                    window.location.href = response.redirect;
                }
            },
            complete: function () {

            },
            error: function () {
                load.fadeOut();
                ajaxMessage(ajaxResponseRequestError, 5);
            }
        });
    }
});

$(".js_proposta_remover").on("click", function (e) {
    e.preventDefault();

    const btn = $(this);
    const uuid = btn.data("uuid");
    const action = btn.data("action");

    if (action) {
        $.ajax({
            url: action,
            type: "POST",
            data: { uuid },
            dataType: "json",
            beforeSend: function () {
                load.fadeIn(200).css("display", "flex");
            },
            success: function (response) {
                if (response.message) {
                    ajaxMessage(response.message, 3);
                    load.fadeOut(200);
                }

                if (response.success) {
                    const cardId = btn.closest('[data-id]').data("id");
                    const cards = $(`[data-id='${cardId}']`);
                    cards.fadeOut(200, function () {
                        cards.remove();
                    });
                }
            },
            complete: function () {
                load.fadeOut(200);
            },
            error: function () {
                load.fadeOut();
                ajaxMessage(ajaxResponseRequestError, 5);
            }
        });
    }
});

$("[name='quantidade'], [name='valor'], [name='observacao']").on("keyup", function (e) {
    e.preventDefault();

    const btn = $(this);
    const card = btn.closest('.item-status');

    const quantidade = card.find("[name='quantidade']");
    const valor = card.find("[name='valor']");
    const observacao = card.find("[name='observacao']");

    if (
        quantidade.val() != quantidade.data("default-value") ||
        valor.val() != valor.data("default-value") ||
        observacao.val() != observacao.data("default-value")
    ) {
        const btnAtualizar = card.find(".js_proposta_atualizar");
        btnAtualizar.fadeIn(200).css("display", "flex");
    } else {
        const btnAtualizar = card.find(".js_proposta_atualizar");
        btnAtualizar.fadeOut(200).style("display", "none");
    }
});

$(".js_download_proposta").on("click", function (e) {
    const { jsPDF } = window.jspdf;
    const selector = $(".content-tab");
    const textarea = $(".product-description-textarea");
    const price = $(".price-container-span");
    const quantity = $(".quantity-container-span");

    textarea.each(function (e) {
        const infoDescription = $(this).parent().find(".info-table");
        $(this).hide();
        infoDescription.text($(this).val());
        infoDescription.toggleClass("d-none")
    });

    price.each(function(e) {
        const input = $(this).find('input');
        const symbolLabel = $(this).find('.price-symbol-label');

        input.hide();
        symbolLabel.text(`R$ ${input.val()}`);
    });

    quantity.each(function (e) {
        const inputQntd = $(this).find('input');
        const spanQntd = $(this).find('.quantity-container-label');

        inputQntd.hide();
        spanQntd.text(inputQntd.val());
        spanQntd.toggleClass("d-none");
    });

    load.fadeIn(200).css("display", "flex");

    const hiddenButtons = selector.find("button:visible").hide();

    selector.css("width", "100%");

    html2canvas(document.querySelector(".content-tab"), {
        allowTaint: false,
        scale: 1.5
    })
        .then(function (canvas) {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'px',
                format: [canvas.width, canvas.height],
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save("proposta.pdf");

            hiddenButtons.show();

            textarea.each(function (e) {
                const infoDescription = $(this).parent().find(".info-table");
                $(this).show();
                infoDescription.text("");
                infoDescription.toggleClass("d-none")
            });

            price.each(function(e) {
                const input = $(this).find('input');
                const symbolLabel = $(this).find('.price-symbol-label');

                input.show();
                symbolLabel.text("R$");
            });

            quantity.each(function (e) {
                const inputQntd = $(this).find('input');
                const spanQntd = $(this).find('.quantity-container-label');

                inputQntd.show();
                spanQntd.text("");
                spanQntd.toggleClass("d-none");
            });
        })
        .finally(function () {
            selector.css("width", "100%");
            load.fadeOut(200);
        });

});

$(".open-modal-product").click(function () {
    const modal = $(this).find("a");
    const modalId = modal.attr("href");

    if (modalId) {
        $(`.wrap-modal${modalId}`).fadeIn();
    }
    return false;
});

$(".open-modal-acabamento").click(function () {
    const modalId = $(this).attr("href");

    if (modalId) {
        $(modalId).fadeIn();
    }
    return false;
});

function resizeImages() {
    const windowWidth = $(window).width();

    if (windowWidth < 1200) {
        $("img.break").each(function () {
            const img = $(this);
            const srcBreak = img.data("break");

            img.attr("src", srcBreak);
        });
    } else {
        $("img.break").each(function () {
            const img = $(this);
            const srcNormal = img.data("normal");

            img.attr("src", srcNormal);
        });
    }
}

$(window).on("load", function () {
    resizeImages();
});

$(window).on("resize", function () {
    resizeImages();
});