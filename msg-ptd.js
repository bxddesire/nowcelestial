$(function() {
    $(".profil_champ").attr("id", function(div) {
        return "field_id" + div
    })
});
!window.FAM && (function() {
    "use strict";
    window.FAM = {
        config: {
            chat_page: "",
            chat_permission: "all",
            main_title: "Messenger",
            tabs: true,
            initial_tabs: [{
                url: 'https://pretend.forumactif.com/f30-017-after-hours',
                title: 'SMS'
            }, {
                url: 'https://pretend.forumactif.com/f55-001-on-my-mind',
                title: 'LINKME'
            }, {
                url: 'https://pretend.forumactif.com/t44-le-flood',
                title: 'FLOOD'
            }, {
                url: 'https://pretend.forumactif.com/f50-001-pink-pony-club',
                title: 'JEUX'
            }],
            ignore_announcements: false,
        },
        select: {
            forum_info: ".forumtitle",
            forumtitle: "a.forumtitle, a.topictitle",
            topic: ".cate_corps, td.row1, td.row2, tr.row1, tr.row2, .topicslist_row",
            lastpost_date: ".lastpost_date",
            lastpost_avatar: ".sujet_lastavatar img, .lastpostavatar img, ",
            topic_type: ".topic-type > strong",
            post: "tr.post",
            post_avatar: ".sujet_avatar img",
            post_name: ".post_pseudo",
            post_date: ".post_date time",
            post_message: ".post_content",
            pagination: ".paginer_topic:not(strong)",
            page_back: ".sprite-arrow_subsilver_left:first-child",
            new_topic: '[href$="mode=newtopic"]',
            post_reply: '[href$="mode=reply"]',
        },
        lang: {
            loading: "Chargement",
            idle: "Forumactif Messenger est en veille.<br> Cliquez pour reprendre.",
            message_notif_singular: "$N nouveau message",
            message_notif_plural: "$N nouveau messages",
            new_messages: "Nouveaux Messages",
            new_topic: "Nouveau sujet",
            start_topic: "Ouvrir un sujet",
            forum_name: "Forums",
            topic_name: "Sujets",
            msg_placeholder: "Envoyer un message",
            title_placeholder: "Titre du sujet",
            load_older: "Voir les anciens messages",
            delete_message: "Voulez-vous supprimer ce message ?",
            topic_no_subject: "Vous devez indiquer un titre pour votre sujet.",
            topic_no_message: "Vous devez écrire un message avant d'ouvrir votre sujet.",
            no_tabs_title: "Ouvrir un nouvel onglet",
            no_tabs: "Vous n'avez pas d'onglet ouvert. Cliquez pour en ouvrir un.",
            no_tabs_initial: "Voulez-vous ouvrir les onglets de départ ?",
            tooltip_openFAM: "Forumactif Messenger",
            tooltip_back: "Retour",
            tooltip_menu: "Ouvrir le menu",
            tooltip_home: "Page d'accueil",
            tooltip_about: "A propos",
            tooltip_emoji: "Ajouter un smiley",
            tooltip_send: "Envoyer un message",
            tooltip_msg_quote: "Citer",
            tooltip_msg_edit: "Editer",
            tooltip_msg_delete: "Supprimer",
            error_sending: "Une erreur empêche l'envoi de votre message. Réessayer ?",
            error_resend: "Envoyer",
            error_delete: "Supprimer",
            error_report: "Signaler",
            guest: "Invité",
            yes: "Oui",
            no: "Non",
            send: "Envoyer",
            cancel: "Annuler",
            reset: "Réinitialiser",
        },
        toggle: function() {
            if (FAM.cache.chat.dataset.hidden == "true") {
                FAM.cache.chat.dataset.hidden = false;
                if (!FAM.history.restore()) {
                    FAM.tab.initial();
                    FAM.tab.loaded = true
                }
            } else {
                FAM.cache.chat.dataset.hidden = true
            }
        },
        encode: function(string) {
            return /UTF-8/i.test(document.characterSet) ? encodeURIComponent(string) : encodeURIComponent(escape(string).replace(/%u[A-F0-9]{4}/g, function(match) {
                return "&#" + parseInt(match.substr(2), 16) + ";"
            })).replace(/%25/g, "%")
        },
        normalizeUsername: function(value) {
            return (value || "").replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim().toLowerCase()
        },
        updateUserdata: function(data) {
            var script = document.createElement("SCRIPT");
            script.type = "text/javascript";
            script.text = data.replace(/[\s\S]*?(if\(typeof\(_userdata\) == "undefined"\)[\s\S]*?)if\(typeof\(_board\) == "undefined"\)[\s\S]*/, "$1");
            document.body.appendChild(script)
        },
        clearRequest: function() {
            if (FAM.request) {
                if (!FAM.request.statusText) {
                    FAM.request.abort()
                }
                delete FAM.request
            }
            if (FAM.cache.chat.querySelector("#FAM-new-msg-notif")) {
                FAM.message.markRead(true, true)
            }
        },
        get: function(url, title, noHistory) {
            var type = /\/c\d+/.test(url) ? "category" : /\/f\d+/.test(url) ? "forum" : /\/t\d+/.test(url) ? "topic" : /\/search|\/st\/|\/sta\//.test(url) ? "search" : "category";
            if (!noHistory) {
                FAM.history.update({
                    url: url,
                    title: title,
                })
            }
            FAM.clearRequest();
            FAM.message.listener.stop();
            FAM.history.toggleBack();
            FAM.tab.title(title);
            FAM.cache.content.className = "FAM-viewing-" + type;
            FAM.cache.content.innerHTML = '<div class="FAM-loading">' + '<i class="bi bi-hourglass"></i>' + '<span class="sr-only">' + FAM.lang.loading + "</span>" + "</div>";
            FAM.cache.actions.innerHTML = "";
            if (type == "topic") {
                FAM.message.log = {}
            }
            FAM.request = $.get(url, function(data) {
                var a = $(FAM.select[type == "topic" ? "post" : "forumtitle"], data)
                  , form = type == "topic" ? $('form[action="/post"]', data)[0] : null
                  , i = 0
                  , j = a.length
                  , html = "";
                for (; i < j; i++) {
                    html += type == "topic" ? (FAM.message.log[a[i].className.replace(/.*?(post--\d+).*/, "$1")] = FAM.message.parse(a[i], i, a[i + 1])) : FAM.topic.parse(a[i])
                }
                if (type == "topic") {
                    var postReply = $(FAM.select.post_reply, data)[0]
                      , back = $(FAM.select.page_back, data)[0];
                    FAM.cache.content.innerHTML = (back ? '<button id="FAM-load-older" class="FAM-button" onclick="FAM.message.loadOlder(\'' + (back.tagName == "A" ? back : back.parentNode).href + '\');" type="button">' + FAM.lang.load_older + "</button>" : "") + html;
                    if (postReply) {
                        FAM.cache.content.className += " FAM-reply-open";
                        FAM.cache.actions.innerHTML = '<span id="FAM-msg-container">' + '<textarea id="FAM-msg" placeholder="' + FAM.lang.msg_placeholder + '" onkeydown="FAM.message.handleKeys(event);" oninput="FAM.message.validate(this.value);"></textarea>' + '<span id="FAM-timeout-bar"></span>' + "</span>" + '<div class="FAM-buttons-container">' + '<button id="FAM-send" type="button" onclick="FAM.message.send();" data-disabled="true" title="' + FAM.lang.tooltip_send + '" type="button"><i class="bi bi-send-fill"></i></button>' + '<button id="FAM-emoji" type="button" onclick="FAM.message.emoji(this);" title="' + FAM.lang.tooltip_emoji + '" type="button"><i class="bi bi-emoji-smile-fill"></i></button>' + (form ? form.outerHTML.replace(/id=".*?"|name=".*?"/, "").replace("<form", '<form id="FAM-post-data" name="fampost" style="display:none"') : '<div id="FAM-post-data-placeholder"></div>' + "</div>");
                        $("#FAM-msg").each(function() {
                            this.setAttribute("style", "height:" + this.scrollHeight + "px;overflow-y:hidden;")
                        }).on("input", function() {
                            this.style.height = "auto";
                            this.style.height = this.scrollHeight + "px"
                        });
                        if (!_userdata.session_logged_in) {
                            FAM.message.replyPage = postReply.href;
                            FAM.message.authorizeGuest()
                        }
                    } else {
                        FAM.cache.actions.innerHTML = ""
                    }
                    FAM.message.scroll();
                    FAM.message.listener.start();
                    var servImgData = {
                        account: data.match(/servImgAccount = '(.*?)'/),
                        id: data.match(/servImgId = '(.*?)'/),
                        f: data.match(/servImgF = '(.*?)'/),
                        mode: data.match(/servImgMode = '(.*?)'/),
                    }, authorization = "multiupload.php?", denied = false, i;
                    for (i in servImgData) {
                        if (servImgData[i] && servImgData[i][0] && servImgData[i][1]) {
                            authorization += i + "=" + servImgData[i][1] + "&"
                        } else {
                            denied = true;
                            break
                        }
                    }
                    FAM.message.servImgData = denied ? "" : authorization
                } else {
                    var pagination = /forum|search/.test(type) ? $(FAM.select.pagination, data)[0] : null;
                    FAM.cache.content.innerHTML = (pagination ? '<div class="FAM-pagination">' + pagination.innerHTML.replace(/&nbsp;|â€¢|<br>|,|•|:|<span class="page-sep">.*?<\/span>|<a.*?href=".*?mark=topics">.*?<\/a>|<a.*?href="javascript:Pagination\(\);"[^>]*?>.*?<\/a>|<a[^>]*?><img.*?><\/a>/g, "").replace(/>\d+<\/(.*?)>/g, function(match, $1) {
                        return (' class="FAM-page-link"' + ($1.toUpperCase() == "A" ? " onclick=\"FAM.get(this.href, '" + title + "'); return false;\"" : "") + match)
                    }).replace(/>\s+</g, "><") + "</div>" : "") + html || '<div class="FAM-loading FAM-noclick">' + '<p class="FAM-clickable"><i class="bi bi-emoji-frown"></i>' + FAM.lang.not_found + (_userdata.session_logged_in ? "" : " " + FAM.lang.not_found_offline) + "</p>" + "</div>";
                    FAM.cache.actions.innerHTML = "";
                    if (type == "forum") {
                        var newTopic = $(FAM.select.new_topic, data)[0];
                        if (newTopic) {
                            FAM.cache.actions.innerHTML = '<span id="FAM-new-topic" onclick="FAM.topic.create(\'' + newTopic.href + '\');" title="' + FAM.lang.new_topic + '">' + '<i class="bi bi-plus-circle-fill"></i>' + "</span>"
                        }
                    }
                }
                FAM.clearRequest()
            })
        },
        message: {
            insert: function(string, pad) {
                var msg = FAM.cache.actions.querySelector("#FAM-msg")
                  , addedText = (pad ? " " : "") + string + (pad ? " " : "")
                  , position = 0;
                if (msg) {
                    try {
                        position = msg.selectionEnd;
                        msg.value = msg.value.slice(0, position) + addedText + msg.value.slice(position, msg.length);
                        msg.selectionEnd = position + addedText.length
                    } catch (e) {
                        msg.value += addedText
                    }
                    msg.focus();
                    FAM.message.validate(msg.value)
                }
            },
            mention: function(caller) {
                FAM.message.insert('@"' + caller.innerText + '"', true)
            },
            interact: function(caller, post) {
                var old = {
                    fn: caller.onclick,
                    html: caller.innerHTML,
                };
                caller.innerHTML = '<i class="bi bi-hourglass"></i>';
                caller.onclick = null;
                $.get(post, function(data) {
                    var form = $('form[action="/post"]', data)[0]
                      , mode = post.split("=").pop();
                    caller.innerHTML = old.html;
                    caller.onclick = old.fn;
                    if (form) {
                        switch (mode) {
                        case "quote":
                            FAM.message.insert(form.message.value);
                            break;
                        case "editpost":
                            caller = $(caller).closest(".FAM-msg")[0];
                            if (FAM.message.edit.placeholder) {
                                FAM.message.edit.cancel()
                            }
                            FAM.message.edit.form = form;
                            FAM.message.edit.backup = caller.outerHTML;
                            FAM.message.edit.placeholderSettings = {
                                id: "FAM-msg-editing",
                                avatar: caller.querySelector(".FAM-msg-avatar").innerHTML,
                                username: caller.querySelector(".FAM-msg-name").innerHTML,
                                notMine: caller.className.indexOf("FAM-my-msg") == -1,
                            };
                            FAM.message.edit.placeholder = FAM.message.write('<textarea class="FAM-inputbox">' + form.message.value + "</textarea>" + '<div class="FAM-row FAM-center FAM-inline-buttons">' + '<button class="FAM-button FAM-edit-confirm" onclick="FAM.message.edit.confirm();"><i class="bi bi-check-circle-fill"></i></button>' + '<button class="FAM-button FAM-edit-cancel" onclick="FAM.message.edit.cancel();"><i class="bi bi-x-circle"></i></button>' + "</div>", FAM.message.edit.placeholderSettings, caller);
                            break;
                        case "delete":
                            if (confirm(FAM.lang.delete_message)) {
                                caller = $(caller).closest(".FAM-msg")[0];
                                caller.className += " FAM-msg-placeholder";
                                caller.querySelector(".FAM-msg-content").innerHTML = '<div class="FAM-msg-text"><i class="bi bi-hourglass"></i></div>';
                                $.post("/post", $(form).serialize() + "&confirm=1", function() {
                                    FAM.cache.content.removeChild(caller);
                                    delete FAM.message.log["post--" + form.p.value]
                                })
                            }
                            break
                        }
                    } else {
                        alert(FAM.lang.actions_error)
                    }
                })
            },
            edit: {
                confirm: function() {
                    if (FAM.message.edit.placeholder) {
                        FAM.message.backup = FAM.message.edit.placeholder.querySelector(".FAM-inputbox").value;
                        FAM.message.send(true, FAM.message.edit.form, {
                            replacement: FAM.message.edit.placeholder,
                            placeholderSettings: {
                                id: "FAM-msg-placeholder",
                                avatar: FAM.message.edit.placeholderSettings.avatar,
                                username: FAM.message.edit.placeholderSettings.username,
                                notMine: FAM.message.edit.placeholderSettings.notMine,
                            },
                        });
                        delete FAM.message.edit.placeholder
                    }
                },
                cancel: function() {
                    if (FAM.message.edit.placeholder) {
                        if (FAM.message.edit.placeholder.parentNode) {
                            FAM.message.edit.placeholder.insertAdjacentHTML("afterend", FAM.message.edit.backup);
                            FAM.cache.content.removeChild(FAM.message.edit.placeholder)
                        }
                        delete FAM.message.edit.placeholder
                    }
                },
            },
            write: function(message, data, replacement) {
                data = data || {};
                var msg = document.createElement("DIV");
                msg.dataset.who = data.username;
                msg.className = "FAM-msg " + (data.notMine ? "" : "FAM-my-msg") + " " + (data.id || "");
                msg.innerHTML = '<div class="FAM-msg-avatar">' + (data.avatar || _userdata.avatar) + "</div>" + '<div class="FAM-msg-box">' + '<div class="FAM-msg-name">' + (data.username || "") + "</div>" + '<div class="FAM-msg-content">' + '<div class="FAM-msg-text">' + (message || "") + "</div>" + "</div>" + '<div class="FAM-msg-date"></div>' + "</div>";
                if (replacement) {
                    FAM.cache.content.insertBefore(msg, replacement);
                    FAM.cache.content.removeChild(replacement)
                } else {
                    FAM.cache.content.appendChild(msg);
                    FAM.message.scroll()
                }
                return msg
            },
            handleKeys: function(e) {
                if (e) {
                    var key = e.key || e.which || e.keyCode;
                    if ({
                        Enter: 1,
                        13: 1,
                    }[key] && !e.shiftKey) {
                        FAM.cache.actions.querySelector("#FAM-send").dataset.disabled != "true" && FAM.message.send();
                        e.preventDefault()
                    }
                }
            },
            validate: function(message) {
                message = message || null;
                var send = FAM.cache.actions.querySelector("#FAM-send")
                  , disabled = send.dataset.disabled == "true";
                if (message && disabled) {
                    send.dataset.disabled = false
                } else if (!message && !disabled) {
                    send.dataset.disabled = true
                }
            },
            send: function(resend, form, msgData) {
                msgData = msgData || {};
                if (FAM.message.sending) {
                    return false
                } else {
                    FAM.message.sending = true
                }
                FAM.message.clearError();
                var msg = document.getElementById("FAM-msg")
                  , placeholder = FAM.message.write('<i class="bi bi-hourglass"></i>', msgData.placeholderSettings || {
                    id: "FAM-msg-placeholder"
                }, msgData.replacement)
                  , val = resend ? FAM.message.backup : msg.value
                  , i = 0;
                if (!resend) {
                    msg.value = "";
                    FAM.message.validate();
                    FAM.message.backup = val
                }
                $.post("/post", $(form || document.fampost).serialize().replace(/message=.*?(?:&|$)/, "message=" + FAM.encode(val) + "&") + "&post=1&prevent_post=1", function(data) {
                    var success = $('a[href^="/viewtopic"]', data)[0]
                      , captcha = $("#funcaptcha", data);
                    if (msgData.placeholderSettings) {
                        var settings = msgData.placeholderSettings;
                        settings.id = "FAM-msg-error"
                    }
                    if (success) {
                        FAM.message.check(function() {
                            if (msgData.replacement) {
                                $.get(success.href, function(data) {
                                    var post = $(FAM.select.post + form.p.value, data)[0];
                                    if (post) {
                                        placeholder.insertAdjacentHTML("afterend", (FAM.message.log[form.p.value] = FAM.message.parse(post, 1, "")));
                                        FAM.cache.content.removeChild(placeholder)
                                    }
                                })
                            } else {
                                FAM.cache.content.removeChild(placeholder);
                                FAM.message.scroll()
                            }
                            var bar = FAM.cache.actions.querySelector("#FAM-timeout-bar")
                              , progress = 5000;
                            bar.style.height = "100%";
                            FAM.message.timeoutBar = setInterval(function() {
                                if ((progress -= 50) <= 0 || !FAM.message.sending) {
                                    clearInterval(FAM.message.timeoutBar);
                                    FAM.message.sending = false;
                                    bar.style.height = "0%"
                                } else {
                                    bar.style.height = (progress / 5000) * 100 + "%"
                                }
                            }, 40);
                            if (!_userdata.session_logged_in) {
                                FAM.message.authorizeGuest()
                            }
                        })
                    } else if (captcha.length) {
                        FAM.cache.content.removeChild(placeholder);
                        FAM.message.error = FAM.message.write('<div class="FAM-center"><i class="bi bi-exclamation-circle"></i></div>' + captcha.closest("form")[0].outerHTML.replace(/<noscript>(.*?)<\/noscript>/g, function(match, $1) {
                            return $1.replace(/&lt;|&gt;/g, function(match) {
                                return {
                                    "&lt;": "<",
                                    "&gt;": ">",
                                }[match]
                            })
                        }).replace(/class="gensmall"/g, "").replace(/<div style="[^"]*?">/, '<div class="FAM-row">').replace(/<input([^>]*?)style="[^"]*?"([^>]*?)>/, '<input class="FAM-inputbox" $1 $2>').replace(/<input[^>]*?type="submit"[^>]*?value="(.*?)"[^>]*?>/, '<button class="FAM-button" type="button">$1</button>').replace("<form", '<form class="FAM-center FAM-captcha"'), settings || {
                            id: "FAM-msg-error"
                        });
                        FAM.message.error.querySelector(".FAM-button").onclick = function() {
                            FAM.message.sending = false;
                            FAM.message.send(true, $(this).closest("form").clone()[0], msgData);
                            return false
                        }
                    } else {
                        FAM.message.sending = false;
                        FAM.cache.content.removeChild(placeholder);
                        FAM.message.error = FAM.message.write('<div class="FAM-center"><i class="bi bi-exclamation-circle"></i></div>' + FAM.lang.error_sending + '<textarea id="FAM-resend-message" class="FAM-inputbox">' + FAM.message.backup + "</textarea>" + '<a onclick="FAM.message.send(true);">' + FAM.lang.error_resend + "</a> | " + '<a onclick="FAM.message.clearError();">' + FAM.lang.error_delete + "</a>" + '<a href="https://github.com/SethClydesdale/forumactif-messenger/wiki/Reporting-Bugs" target="_blank" style="float:right;">' + FAM.lang.error_report + "</a>", settings || {
                            id: "FAM-msg-error"
                        });
                        console.log(data)
                    }
                })
            },
            clearError: function() {
                if (FAM.message.error) {
                    if (FAM.cache.content.querySelector(".FAM-msg-error")) {
                        var txt = FAM.message.error.querySelector("#FAM-resend-message");
                        if (txt) {
                            FAM.message.backup = txt.value
                        }
                        FAM.cache.content.removeChild(FAM.message.error)
                    }
                    delete FAM.message.error
                }
            },
            loadOlder: function(page) {
                var button = FAM.cache.content.querySelector("#FAM-load-older");
                button.setAttribute("onclick", "");
                button.innerHTML = '<i class="bi bi-hourglass"></i>';
                $.get(page, function(data) {
                    var back = $(FAM.select.page_back, data)[0], post = $(FAM.select.post, data), html = "", i = 0, j = post.length, load, pid;
                    for (; i < j; i++) {
                        pid = post[i].className.replace(/.*?(post--\d+).*/, "$1");
                        if (!FAM.message.log[pid]) {
                            console.log(post[i]);
                            html += FAM.message.log[pid] = FAM.message.parse(post[i], i, post[i + 1])
                        }
                    }
                    if (back) {
                        button.setAttribute("onclick", "FAM.message.loadOlder('" + (back.tagName == "A" ? back : back.parentNode).href + "')");
                        button.innerHTML = FAM.lang.load_older
                    } else {
                        button.style.display = "none"
                    }
                    button.insertAdjacentHTML("afterend", html + '<div id="page-load"></div>');
                    load = FAM.cache.content.querySelector("#page-load");
                    FAM.message.scroll(load.previousSibling.offsetTop - 60);
                    FAM.cache.content.removeChild(load)
                })
            },
            parse: function(post, index, nextPost) {
                if (post.id == "p0") {
                    return ""
                }
                if (index == 0) {
                    var indicator = $(FAM.select.post_message + " > strong:first-child", post)[0];
                    if (indicator && /&nbsp;/.test(indicator.innerHTML)) {
                        return ""
                    }
                }
                var avatar, name, pLink, group, date, online, msg, quote, edit, remove, nameNext;
                quote = $('a[href$="mode=quote"]', post)[0];
                edit = $('a[href$="mode=editpost"]', post)[0];
                remove = $('a[href$="mode=delete"]', post)[0];
                avatar = $(FAM.select.post_avatar, post)[0];
                name = $(FAM.select.post_name, post)[0];
                nameNext = $($(FAM.select.post_name, nextPost)[0]).text();
                pLink = name ? name.querySelector("a[href]") : null;
                pLink = pLink ? '<a href="' + pLink.href + '">' : null;
                group = name ? name.getElementsByTagName("SPAN")[0] : null;
                group = group ? '<span style="' + group.getAttribute("style") + '"><strong>' : null;
                name = name ? name.innerText : FAM.lang.guest;
                online = post.className.indexOf("online") != -1;
                date = $(FAM.select.post_date, post)[0];
                msg = $(FAM.select.post_message, post)[0];
                var isHidden = nameNext.indexOf(name) != 0
                  , currentUsername = _userdata && typeof _userdata.username !== "undefined" ? _userdata.username : ""
                  , isMine = FAM.normalizeUsername(name) == FAM.normalizeUsername(currentUsername);
                return ('<div data-compact="' + (isHidden ? "" : "yes") + '" class="FAM-msg' + (online ? " FAM-msg-online" : "") + (isMine || (!_userdata.session_logged_in && name == FAM.lang.guest) ? " FAM-my-msg" : "") + " " + post.className.replace(/.*?(post--\d+).*/, "$1") + '">' + '<div class="FAM-msg-avatar">' + (pLink ? pLink : "") + '<img src="' + (avatar ? avatar.src : "https://2img.net/i/fa/empty.gif") + '" alt="avatar">' + (pLink ? "</a>" : "") + "</div>" + '<div class="FAM-msg-box" title="' + (date ? date.innerHTML.split("<").shift().replace(/^\s+|\s+$/g, "") : "") + ' ">' + '<div class="FAM-msg-content">' + '<div class="FAM-msg-text">' + (msg ? msg.innerHTML.replace(/<br>/g, "\n").replace(/^\n+|\n+$|^\s+|\s+$/g, "").replace(/\n/g, "<br>").replace(/class="(.*?)"/g, function(match, $1) {
                    return $1.indexOf("FAM-") == -1 ? 'class="FAM-' + $1.split(" ").join(" FAM-") + '"' : match
                }).replace(/<blockquote>/g, '<blockquote class="FAM-codebox">').replace(/<img/g, '<img onclick="FAM.modal.open(this);"').replace(/<table class="FAM-attachment">([\s\S]*?)<\/table>/, function(match, $1) {
                    return '<table class="FAM-attachment">' + $1.replace(/<td/g, '<td onclick="FAM.modal.open(this);"') + "</table>"
                }) : "") + "</div>" + '<div class="FAM-msg-actions">' + (quote ? '<span class="FAM-msg-button FAM-quote-button" onclick="FAM.message.interact(this, \'' + quote.href + '\');" title="' + FAM.lang.tooltip_msg_quote + '"><i class="bi bi-reply-fill"></i></span>' : "") + (edit ? '<span class="FAM-msg-button FAM-edit-button" onclick="FAM.message.interact(this, \'' + edit.href + '\');" title="' + FAM.lang.tooltip_msg_edit + '"><i class="bi bi-pencil-fill"></i></span>' : "") + (remove ? '<span class="FAM-msg-button FAM-delete-button" onclick="FAM.message.interact(this, \'' + remove.href + '\');" title="' + FAM.lang.tooltip_msg_delete + '"><i class="bi bi-x"></i></span>' : "") + "</div>" + "</div>" + '<div class="FAM-msg-info">' + '<div class="FAM-msg-name">' + '<span class="FAM-name-mention" onclick="FAM.message.mention(this);">' + (pLink ? pLink : "").replace("<a", '<a onclick="return false;"') + (group ? group : "") + name + (group ? "</strong></span>" : "") + (pLink ? "</a>" : "") + "</span>" + "</div>" + '<div class="FAM-msg-date">' + (date ? date.innerHTML.split("<").shift().replace(/^\s+|\s+$/g, "") : "") + "</div>" + "</div>" + "</div>" + "</div>")
            },
            check: function(callback) {
                FAM.request = $.get(FAM.history.log["tab" + FAM.tab.active][FAM.history.log["tab" + FAM.tab.active].length - 1].url, function(data) {
                    for (var a = $(FAM.select.post, data), i = 0, j = a.length, pid, msg, row; i < j; i++) {
                        pid = a[i].className.replace(/.*?(post--\d+).*/, "$1");
                        msg = FAM.message.parse(a[i], i, a[i + 1]);
                        if (msg) {
                            if (FAM.message.log[pid]) {
                                if (FAM.message.log[pid] != msg) {
                                    FAM.message.log[pid] = msg;
                                    row = FAM.cache.content.querySelector(".FAM-msg." + pid);
                                    if (row) {
                                        row.outerHTML = msg
                                    }
                                }
                            } else {
                                FAM.message.log[pid] = msg;
                                FAM.cache.content.insertAdjacentHTML("beforeend", msg);
                                if (msg.indexOf("FAM-my-msg") == -1) {
                                    FAM.message.notify(FAM.cache.content.lastChild);
                                    if (FAM.cache.audio && FAM.message.sound) {
                                        FAM.cache.audio.play()
                                    }
                                }
                            }
                        }
                    }
                    if (typeof callback === "function") {
                        callback()
                    }
                })
            },
            unread: [],
            notify: function(newMsg) {
                if (FAM.message.isVisible(newMsg.previousSibling, 5)) {
                    FAM.message.scroll()
                } else {
                    FAM.message.unread.unshift(newMsg);
                    var notif = FAM.cache.chat.querySelector("#FAM-new-msg-notif")
                      , notifMsg = FAM.lang["message_notif_" + (FAM.message.unread.length == 1 ? "singular" : "plural")].replace("$N", FAM.message.unread.length);
                    if (!notif) {
                        FAM.cache.content.insertAdjacentHTML("beforebegin", '<div id="FAM-new-msg-notif" onclick="FAM.message.markRead();">' + notifMsg + "</div>");
                        newMsg.insertAdjacentHTML("beforebegin", '<div id="FAM-new-msg-divider">' + FAM.lang.new_messages + "</div>")
                    } else {
                        notif.innerHTML = notifMsg
                    }
                }
            },
            markRead: function(noScroll, skipTimeout) {
                var divider = FAM.cache.content.querySelector("#FAM-new-msg-divider")
                  , notif = FAM.cache.chat.querySelector("#FAM-new-msg-notif");
                if (!noScroll) {
                    FAM.message.scroll(divider ? divider.offsetTop - 90 : null)
                }
                notif.style.display = "none";
                window.setTimeout(function() {
                    if (divider && divider.parentNode) {
                        divider.parentNode.removeChild(divider)
                    }
                    if (notif) {
                        FAM.cache.chat.removeChild(notif)
                    }
                }, skipTimeout ? 1 : 10000);
                FAM.message.unread = []
            },
            read: function(caller) {
                if (caller.className.indexOf("FAM-viewing-topic") != -1 && FAM.message.unread.length) {
                    if (caller.scrollTop / (caller.scrollHeight - caller.clientHeight) == 1 || FAM.message.isVisible("unread", FAM.message.unread.length - 1)) {
                        FAM.message.markRead(true)
                    }
                }
            },
            isVisible: function(msg, lookBack) {
                if (typeof lookBack == "undefined") {
                    lookBack = 1
                }
                var visible = false, initial = true, loopUnread = msg == "unread", rect;
                if (loopUnread) {
                    msg = FAM.message.unread[lookBack]
                }
                while (lookBack-- > 0) {
                    if (initial == true) {
                        initial = false
                    } else {
                        msg = loopUnread ? FAM.message.unread[lookBack] : msg ? msg.previousSibling : null
                    }
                    if (msg) {
                        rect = msg.getBoundingClientRect();
                        if (rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth)) {
                            visible = true;
                            break
                        }
                    } else {
                        break
                    }
                }
                return visible
            },
            listener: {
                start: function() {
                    FAM.message.listener.listening = setInterval(function() {
                        if (!FAM.message.sending) {
                            FAM.message.check()
                        }
                    }, 5000);
                    FAM.message.listener.idle();
                    $(document).on("mousemove keypress click", FAM.message.listener.idle)
                },
                stop: function() {
                    if (FAM.message.listener.listening) {
                        FAM.message.sending = false;
                        clearInterval(FAM.message.listener.listening);
                        delete FAM.message.listener.listening
                    }
                    if (FAM.message.listener.idling) {
                        clearTimeout(FAM.message.listener.idling);
                        delete FAM.message.listener.idling;
                        $(document).off("mousemove keypress click", FAM.message.listener.idle)
                    }
                },
                idle: function() {
                    if (FAM.message.listener.idling) {
                        clearTimeout(FAM.message.listener.idling)
                    }
                    FAM.message.listener.idling = setTimeout(function() {
                        FAM.message.listener.stop();
                        FAM.cache.chat.insertAdjacentHTML("beforeend", '<div id="FAM-idle" class="FAM-loading" onclick="FAM.message.listener.resume();">' + '<p><i class="bi bi-moon-fill"></i>' + FAM.lang.idle + "</p>" + "</div>")
                    }, 10 * 60 * 1000)
                },
                resume: function() {
                    var idle = FAM.cache.chat.querySelector("#FAM-idle");
                    if (idle) {
                        FAM.cache.chat.removeChild(idle)
                    }
                    FAM.message.check(FAM.message.listener.start)
                },
            },
            scroll: function(amount) {
                FAM.cache.content.scrollTop = amount || (FAM.cache.content.lastChild ? FAM.cache.content.lastChild.offsetTop - 60 : 0)
            },
            emoji: function(caller) {
                var active = FAM.cache.actions.querySelector("#FAM-emoji-list"), selector;
                if (active) {
                    active.style.visibility = active.style.visibility == "hidden" ? "visible" : "hidden"
                } else {
                    selector = document.createElement("IFRAME");
                    selector.src = "/post?mode=smilies";
                    selector.id = "FAM-emoji-list";
                    selector.className = "FAM-dropdown";
                    selector.onload = function() {
                        try {
                            var doc = this.contentDocument || this.contentWindow.document
                              , emoji = doc.querySelectorAll('a[href*="insert_chatboxsmilie"]')
                              , close = doc.querySelector('a[href="javascript:window.close();"]')
                              , select = doc.getElementById("smilies_categ")
                              , i = 0
                              , j = emoji.length;
                            for (; i < j; i++) {
                                emoji[i].dataset.emoji = emoji[i].href.replace(/.*?'(.*?)'.*/, "$1");
                                emoji[i].href = "#";
                                emoji[i].onclick = function() {
                                    FAM.message.insert(this.dataset.emoji, true);
                                    return false
                                }
                            }
                            if (close) {
                                close.parentNode.removeChild(close)
                            }
                            if (select) {
                                select.innerHTML = select.categ.outerHTML + select.mode.outerHTML;
                                select.setAttribute("style", "text-align:center;padding:3px;")
                            }
                        } catch (e) {
                            console.log(e)
                        }
                    }
                    ;
                    caller.parentNode.insertBefore(selector, caller)
                }
            },
            authorizeGuest: function() {
                $.get(FAM.message.replyPage, function(data) {
                    var form = $('form[action="/post"]', data)[0];
                    if (form) {
                        FAM.cache.actions.querySelector("#FAM-post-data-placeholder").innerHTML = form.outerHTML.replace(/id=".*?"|name=".*?"/, "").replace("<form", '<form id="FAM-post-data" name="fampost" style="display:none"');
                        document.fampost.username.value = _userdata.username
                    }
                })
            },
        },
        topic: {
            create: function(url, noHistory) {
                if (!noHistory) {
                    FAM.history.update({
                        url: url,
                        title: "New topic",
                        recall: {
                            path: "topic.create",
                            args: [url, true],
                        },
                    })
                }
                FAM.clearRequest();
                FAM.history.toggleBack();
                FAM.tab.title(FAM.lang.new_topic);
                FAM.cache.content.className = "FAM-viewing-newtopic";
                FAM.cache.content.innerHTML = '<div class="FAM-loading">' + '<i class="bi bi-hourglass"></i>' + '<span class="sr-only">' + FAM.lang.loading + "</span>" + "</div>";
                FAM.cache.actions.innerHTML = "";
                FAM.request = $.get(url, function(data) {
                    var form = $('form[action="/post"]', data)[0];
                    FAM.cache.content.innerHTML = '<div id="FAM-newtopic-box">' + '<form name="fampost">' + '<div class="FAM-row"><input id="FAM-topic-subject" class="FAM-inputbox" type="text" placeholder="' + FAM.lang.title_placeholder + '" name="subject"></div>' + '<div class="FAM-row"><textarea id="FAM-topic-message" class="FAM-inputbox" name="message" placeholder="' + FAM.lang.msg_placeholder + '"></textarea></div>' + '<div class="FAM-row FAM-center"><button class="FAM-button-large" type="button" onclick="FAM.topic.publish()" type="button">' + FAM.lang.start_topic + "</button></div>" + '<div style="display:none">' + $('input[name="auth[]"]', form)[0].parentNode.innerHTML + "</div>" + "</form>" + "</div>";
                    if (FAM.topic.backup) {
                        document.fampost.subject.value = FAM.topic.backup.subject;
                        document.fampost.message.value = FAM.topic.backup.message;
                        if (!FAM.topic.backup.subject) {
                            document.fampost.subject.insertAdjacentHTML("afterend", '<p class="FAM-error FAM-center">' + FAM.lang.topic_no_subject + "</p>")
                        }
                        if (!FAM.topic.backup.message) {
                            document.fampost.message.insertAdjacentHTML("afterend", '<p class="FAM-error FAM-center">' + FAM.lang.topic_no_message + "</p>")
                        }
                        delete FAM.topic.backup
                    }
                })
            },
            publish: function() {
                FAM.topic.backup = {
                    subject: document.fampost.subject.value,
                    message: document.fampost.message.value,
                };
                var formData = $(document.fampost).serialize().replace(/(subject|message)=.*?&/g, function(match, key) {
                    return (key + "=" + FAM.encode({
                        subject: FAM.topic.backup.subject,
                        message: FAM.topic.backup.message,
                    }[key]) + "&")
                }) + "&post=1";
                FAM.cache.content.innerHTML = '<div class="FAM-loading">' + '<i class="bi bi-hourglass"></i>' + '<span class="sr-only">' + FAM.lang.loading + "</span>" + "</div>";
                $.post("/post", formData, function(data) {
                    var success = $('a[href^="/viewtopic?t="]', data)[0];
                    if (success) {
                        FAM.get("/t" + success.href.replace(/.*?t=(\d+)&.*/, "$1") + "-" + encodeURIComponent(FAM.topic.backup.subject.toLowerCase().replace(/\s/g, "-")) + "?view=newest", FAM.topic.backup.subject);
                        delete FAM.topic.backup
                    } else {
                        var history = FAM.history.log["tab" + FAM.tab.active];
                        FAM.topic.create(history[history.length - 1].url, true)
                    }
                })
            },
            parse: function(forumtitle) {
                var row = $(forumtitle).closest(FAM.select.topic);
                if (!row.find(".AD_LastPA")[0]) {
                    row = row[0];
                    var avatar = $(FAM.select.lastpost_avatar, row)[0]
                      , date = $(FAM.select.lastpost_date, row)[0]
                      , type = $(FAM.select.topic_type, row)[0]
                      , type2 = /c\d+-/.test(forumtitle.href) ? "category" : /f\d+-/.test(forumtitle.href) ? "forum" : /t\d+-/.test(forumtitle.href) ? "topic" : "unknown";
                    if (FAM.config.ignore_announcements && type !== undefined) {
                        return ""
                    }
                    return ('<div class="FAM-chat FAM-' + type2 + ($('a[href$="view=newest"]', row)[0] ? " FAM-new-post" : "") + '" onclick="FAM.get(\'' + forumtitle.href.replace(/\?.*$/, "") + (type2 == "topic" ? "?view=newest" : "") + "', this.querySelector('.FAM-chat-title').innerText);\">" + '<div class="FAM-topic-name">' + '<i class="bi bi-chat-fill"></i>' + FAM.lang.topic_name + "</div>" + '<div class="FAM-chat-avatar">' + '<img src="' + (avatar ? avatar.src : "https://2img.net/i/fa/empty.gif") + '" alt="avatar">' + "</div>" + '<div class="FAM-chat-content">' + '<div class="FAM-chat-title">' + forumtitle.innerText + "</div>" + '<div class="FAM-chat-date">' + (date ? date.innerHTML : "") + "</div>" + "</div>" + "</div>")
                } else {
                    return ""
                }
            },
        },
        page: {
            about: {
                open: function(noHistory) {
                    FAM.page.setup("about", noHistory);
                    FAM.cache.content.innerHTML = '<div id="FAM-about">' + '<div id="FAM-service-title" class="FAM-title">' + '<a href="https://github.com/SethClydesdale/forumactif-messenger">' + "<b>Forum</b>actif <b>Messenger</b>" + "</a> <br><br>" + "</div>" + '<div id="FAM-about-info">' + '<p>Made by <a href="https://github.com/SethClydesdale">Seth Clydesdale (AngeTuteur)</a></p>' + "<p>" + "And the awesome " + '<a href="https://github.com/SethClydesdale/forumactif-messenger/graphs/contributors">Forumactif Messenger Community</a>' + "</p>" + "<p>" + "Redesign by Kim for the " + '<a href="https://blankthemerpg.forumactif.com/">Blank Theme</a>' + "</p>" + "</div>" + "</div>"
                },
            },
            setup: function(pageName, noHistory) {
                if (!FAM.tab.active) {
                    FAM.tab.add()
                }
                if (!noHistory) {
                    FAM.history.update({
                        url: "",
                        title: FAM.lang["tooltip_" + pageName],
                        recall: {
                            path: "page." + pageName.replace(/\s/g, "_") + ".open",
                            args: [true],
                        },
                    })
                }
                FAM.clearRequest();
                FAM.history.toggleBack();
                FAM.message.listener.stop();
                FAM.tab.title(FAM.lang["tooltip_" + pageName]);
                FAM.cache.content.className = "FAM-viewing-github";
                FAM.cache.content.innerHTML = '<div class="FAM-loading">' + '<i class="bi bi-hourglass"></i>' + '<span class="sr-only">' + FAM.lang.loading + "</span>" + "</div>"
            },
            parse: function(data, vars) {
                var i;
                vars = vars || {};
                data = data.replace(/\n\s*?</g, "<").replace(/<a/g, '<a target="_blank"').replace(/style="\/\*v1\.0\.0\*\/display:none;"/g, "");
                for (i in vars) {
                    data = data.replace(new RegExp("{" + i + "}","g"), vars[i])
                }
                for (i in FAM.lang) {
                    data = data.replace(new RegExp("{" + i + "}","g"), FAM.lang[i])
                }
                return data
            },
        },
        history: {
            log: {},
            save: function() {
                if (window.JSON && window.localStorage) {
                    localStorage.fam_data = JSON.stringify({
                        active: FAM.tab.active,
                        total: FAM.tab.total,
                        history: FAM.history.log,
                    })
                }
            },
            restore: function() {
                if (window.JSON && window.localStorage && localStorage.fam_data) {
                    if (!FAM.tab.loaded) {
                        var data = JSON.parse(localStorage.fam_data), i;
                        FAM.tab.total = data.total;
                        FAM.history.log = data.history;
                        for (i in FAM.history.log) {
                            FAM.tab.add(i.replace("tab", ""), FAM.history.log[i][FAM.history.log[i].length - 1].title)
                        }
                        if (data.active) {
                            FAM.tab.focus(data.active)
                        } else {
                            FAM.tab.initial()
                        }
                        FAM.tab.loaded = true
                    }
                    return true
                } else {
                    return false
                }
            },
            update: function(history) {
                FAM.history.log["tab" + FAM.tab.active].push(history);
                FAM.history.save()
            },
            back: function(begin) {
                var history = FAM.history.log["tab" + FAM.tab.active][begin ? 0 : FAM.history.log["tab" + FAM.tab.active].length - 2];
                begin ? (FAM.history.log["tab" + FAM.tab.active] = FAM.history.log["tab" + FAM.tab.active].slice(0, 1)) : FAM.history.log["tab" + FAM.tab.active].pop();
                if (history.recall) {
                    FAM.history.recall(history.recall)
                } else {
                    FAM.get(history.url, history.title, true)
                }
                FAM.message.listener.stop();
                FAM.history.save()
            },
            recall: function(data) {
                var path = data.path.split(".")
                  , open = FAM
                  , i = 0
                  , j = path.length;
                for (; i < j; i++) {
                    open = open[path[i]]
                }
                open.apply(null, data.args)
            },
            toggleBack: function() {
                if (FAM.history.log["tab" + FAM.tab.active]) {
                    if (FAM.history.log["tab" + FAM.tab.active].length > 1 && FAM.cache.back.style.display == "none") {
                        FAM.cache.back.style.display = ""
                    } else if (FAM.history.log["tab" + FAM.tab.active].length <= 1 && FAM.cache.back.style.display != "none") {
                        FAM.cache.back.style.display = "none"
                    }
                } else {
                    FAM.cache.back.style.display = "none"
                }
            },
        },
        tab: {
            active: 0,
            total: 0,
            initial: function() {
                FAM.tab.add();
                for (var i = 0, j = FAM.config.initial_tabs.length, id, title; i < j; i++) {
                    id = ++FAM.tab.total;
                    FAM.history.log["tab" + id] = [{
                        url: FAM.config.chat_page,
                        title: FAM.config.main_title,
                    }, ];
                    FAM.config.initial_tabs[i].url = FAM.config.initial_tabs[i].url || "";
                    FAM.config.initial_tabs[i].title = FAM.config.initial_tabs[i].title || "Tab " + id;
                    FAM.history.log["tab" + id].push(FAM.config.initial_tabs[i]);
                    FAM.tab.add(id, FAM.config.initial_tabs[i].title)
                }
            },
            add: function(restore, title) {
                var id = restore || ++FAM.tab.total;
                FAM.cache.tabs.insertAdjacentHTML("beforeend", '<div id="FAM-tab-' + id + '" class="FAM-tab">' + '<span class="FAM-tab-name" onclick="FAM.tab.focus(' + id + ')">' + (title ? title : FAM.lang.loading) + "</span>" + '<i class="bi bi-x" onclick="FAM.tab.close(' + id + ')"></i>' + "</div>");
                if (!restore) {
                    FAM.history.log["tab" + id] = [];
                    FAM.tab.focus(id)
                }
            },
            close: function(id) {
                var dead = FAM.cache.tabs.querySelector("#FAM-tab-" + id)
                  , survivor = dead.previousSibling ? dead.previousSibling : dead.nextSibling ? dead.nextSibling : null;
                if (survivor && id == FAM.tab.active) {
                    FAM.tab.focus(survivor.id.replace("FAM-tab-", ""))
                } else if (!survivor) {
                    FAM.clearRequest();
                    FAM.message.listener.stop();
                    FAM.tab.title(FAM.lang.no_tabs_title);
                    FAM.cache.content.innerHTML = '<div id="FAM-no-tabs" class="FAM-loading" onclick="FAM.tab.prompt(this);">' + '<p><i class="bi bi-plus"></i>' + FAM.lang.no_tabs + "</p>" + "</div>";
                    FAM.cache.actions.innerHTML = "";
                    FAM.tab.active = 0
                }
                dead.parentNode.removeChild(dead);
                delete FAM.history.log["tab" + id];
                FAM.history.save();
                FAM.history.toggleBack()
            },
            focus: function(id) {
                if (id == FAM.tab.active) {
                    return false
                }
                var active = FAM.cache.tabs.querySelector("#FAM-tab-" + FAM.tab.active)
                  , tab = FAM.cache.tabs.querySelector("#FAM-tab-" + id)
                  , history = FAM.history.log["tab" + id];
                if (active) {
                    active.className = "FAM-tab"
                }
                tab.className = "FAM-tab FAM-tab-active";
                FAM.cache.tabs.scrollLeft = tab.offsetLeft - tab.getBoundingClientRect().width;
                FAM.tab.active = id;
                if (history.length) {
                    history = history[history.length - 1];
                    if (history.html) {
                        FAM.cache.content.innerHTML = history.html;
                        FAM.clearRequest()
                    } else {
                        history.recall ? FAM.history.recall(history.recall) : FAM.get(history.url, history.title, true)
                    }
                    FAM.history.save()
                } else {
                    FAM.get(FAM.config.chat_page || "/forum", FAM.config.main_title)
                }
            },
            prompt: function(caller) {
                if (FAM.config.initial_tabs.length) {
                    caller.style.cursor = "auto";
                    caller.onclick = null;
                    caller.innerHTML = '<div class="FAM-row">' + '<p><i class="bi bi-hourglass"></i>' + FAM.lang.no_tabs_initial + "</p>" + '<div class="FAM-inline-buttons">' + '<button class="FAM-button" onclick="FAM.tab.initial();" type="button">' + FAM.lang.yes + "</button>" + '<button class="FAM-button" onclick="FAM.tab.add();" type="button">' + FAM.lang.no + "</button>" + "</div>" + "</div>"
                } else {
                    FAM.tab.add()
                }
            },
            title: function(string) {
                FAM.cache.toolbar.querySelector(".FAM-maintitle").innerText = string;
                FAM.cache.tabs.querySelector("#FAM-tab-" + FAM.tab.active + " .FAM-tab-name").innerText = string
            },
        },
        init: function() {
            var initialized = false;
            if (/\/t\d+/.test(FAM.config.chat_page) && !/view=newest/.test(FAM.config.chat_page)) {
                FAM.config.chat_page = FAM.config.chat_page.replace(/#\d+$/, "") + "?view=newest"
            }
            FAM.config.update_channel = FAM.config.update_channel == "developer" ? "-dev" : "";
            function build() {
                if (!{
                    all: 1,
                    member: _userdata.session_logged_in,
                    staff: _userdata.user_level,
                }[FAM.config.chat_permission.toLowerCase()]) {
                    return
                }
                var chat = document.createElement("DIV")
                  , audio = document.createElement("AUDIO")
                  , frag = document.createDocumentFragment()
                  , embed = FAM.config.embed ? document.querySelector(FAM.config.embed) : null;
                chat.id = "FAM";
                chat.className = FAM.config.embed ? "FAM-embedded" : "";
                chat.dataset.hidden = FAM.config.embed ? false : true;
                chat.innerHTML = '<div id="FAM-toolbar">' + '<div id="FAM-toolbar-inner">' + '<span id="FAM-back" class="FAM-toolbar-button" onclick="FAM.history.back()" style="display:none" title="' + FAM.lang.tooltip_back + '"><i class="bi bi-arrow-left-short"></i></span>' + '<h1 class="FAM-maintitle"></h1>' + '<div id="FAM-menu-about" class="FAM-menu-option" onclick="FAM.page.about.open();" title="' + FAM.lang.tooltip_about + '"><i class="bi bi-info-circle"></i></div>' + "</div>" + "</div>" + '<div id="FAM-tab-container" ' + (FAM.config.tabs ? "" : 'style="display:none"') + ">" + '<div id="FAM-tabs"></div>' + '<div id="FAM-tab-add" onclick="FAM.tab.add()"><i class="bi bi-plus"></i></div>' + "</div>" + '<div class="FAM-container-content">' + '<div id="FAM-content" onscroll="FAM.message.read(this);"></div>' + '<div id="FAM-actions"></div>' + "</div>";
                frag.appendChild(chat);
                var button = document.querySelector("#FAM-button-open");
                button.onclick = FAM.toggle;
                FAM.cache = {
                    button: button,
                    chat: chat,
                    audio: audio,
                    back: chat.querySelector("#FAM-back"),
                    toolbar: chat.querySelector("#FAM-toolbar"),
                    tabs: chat.querySelector("#FAM-tabs"),
                    content: chat.querySelector("#FAM-content"),
                    actions: chat.querySelector("#FAM-actions"),
                };
                if (FAM.config.embed) {
                    if (embed) {
                        embed.appendChild(frag)
                    } else {
                        return
                    }
                } else {
                    document.body.appendChild(frag)
                }
                if (FAM.config.embed) {
                    !FAM.history.restore() && FAM.tab.initial();
                    if (window.JSON && window.localStorage && localStorage.fam_settings) {
                        var settings = JSON.parse(localStorage.fam_settings);
                        settings.fam_fullscreen = "";
                        localStorage.fam_settings = JSON.stringify(settings)
                    }
                }
                $(document).on("mousedown", function(e) {
                    var close = [[FAM.cache.actions.querySelector("#FAM-emoji-list"), FAM.cache.actions.querySelector("#FAM-emoji")], [FAM.cache.actions.querySelector("#FAM-attach-options"), FAM.cache.actions.querySelector("#FAM-attachment")], ], i = 0, j = close.length, a;
                    for (; i < j; i++) {
                        if (close[i][0] && close[i][0].style.visibility != "hidden") {
                            a = $(close[i]);
                            if (!a.is(e.target) && !a.has(e.target)[0]) {
                                close[i][0].style.visibility = "hidden"
                            }
                        }
                    }
                });
                delete FAM.init
            }
            try {
                function ready() {
                    if (!initialized && /interactive|complete/.test(document.readyState)) {
                        build();
                        initialized = true
                    }
                }
                ready();
                if (!initialized) {
                    document.addEventListener("readystatechange", ready)
                }
            } catch (error) {
                $(build)
            }
        },
        version: "v1.0.3",
    };
    FAM.init()
}
)();
$(document).ready(function() {
    $('#logout').text('Déconnexion')
});
$(document).ready(function() {
    $('.ntf_button-text').text('notif')
});
$(document).ready(function() {
    const waitForSCEditor = setInterval( () => {
        if ($('.sceditor-toolbar').length && $('.sceditor-container').length) {
            clearInterval(waitForSCEditor);
            const panelHTML = `<button class="toggle-panel"><i class="bi bi-code-slash"></i></button><div class="editor-panel"style="display: none;"><div class="panel-content"><!--Liste des balisesàinsérer-->${['tw', 'i1', 'i2', 'i3', 'i4', 'i5', 'i6', 'i7', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'cc', 'cc2', 'cc4', 'cc5', 'cc6', 'cc7', 'j1', 'j2', 'j4', 'j5', 'j6', 'j7', 'deg1', 'deg2'].map(tag => `<button type="button"data-tag="${tag}"><${tag}>texte</${tag}></button>`).join('')}</div></div>`;
            $('.sceditor-toolbar').after(panelHTML);
            function insertTag(tag) {
                const editorTextarea = $(".sourceMode textarea");
                const editorIframe = $(".sceditor-container iframe").contents().find("body");
                if (editorTextarea.length && editorTextarea.is(":visible")) {
                    const textarea = editorTextarea[0];
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const text = textarea.value;
                    textarea.value = text.substring(0, start) + `<${tag}>` + text.substring(start, end) + `</${tag}>` + text.substring(end);
                    textarea.selectionStart = textarea.selectionEnd = end + tag.length * 2 + 5;
                    textarea.focus()
                } else if (editorIframe.length) {
                    const selection = window.getSelection();
                    if (!selection.rangeCount)
                        return;
                    const range = selection.getRangeAt(0);
                    const span = document.createElement("span");
                    span.innerHTML = `<${tag}>${range.toString()}</${tag}>`;
                    range.deleteContents();
                    range.insertNode(span)
                }
            }
            $('.editor-panel .panel-content button').on('click', function(e) {
                e.preventDefault();
                insertTag($(this).data('tag'))
            });
            $('.toggle-panel').on('click', function(e) {
                e.preventDefault();
                $('.editor-panel').slideToggle(300, () => {
                    const visible = $('.editor-panel').is(':visible');
                    $(this).html(visible ? '<i class="bi bi-code-slash"></i>' : '<i class="bi bi-code-slash"></i>')
                }
                )
            })
        }
    }
    , 500)
});
$('<style>').prop('type', 'text/css').html(`.panel-content button{background-color:transparent}.panel-content button{margin:1px;padding:4px 8px;border:0px solid var(--fond-c4);border-radius:4px;font-family:inherit;cursor:pointer}.panel-content button:hover{background-color:var(--fond-c2)}.panel-content{position:relative;display:block;width:100%;background:var(--fond-c1)}button.toggle-panel{margin:-31px 0 0 575px;position:relative;height:20px;background-color:var(--fond-c2);color:var(--text-c1);font-size:13px;line-height:14px;text-transform:lowercase;border:1px solid var(--fond-c4);border-radius:4px;cursor:pointer}button.toggle-panel:hover{background-color:var(--fond-c4)}.editor-panel{margin-top:8px}`).appendTo('head');
$(function() {
    $(".onglets_pa").each(function() {
        $(".lab").click(function() {
            $(this).addClass("visible").siblings().removeClass("visible");
            if ($(this).hasClass("pa_onglet1")) {
                $(this).parent().next().find(".pa_onglet1").addClass("visible").siblings().removeClass("visible")
            } else if ($(this).hasClass("pa_onglet2")) {
                $(this).parent().next().find(".pa_onglet2").addClass("visible").siblings().removeClass("visible")
            } else if ($(this).hasClass("pa_onglet3")) {
                $(this).parent().next().find(".pa_onglet3").addClass("visible").siblings().removeClass("visible")
            } else if ($(this).hasClass("pa_onglet4")) {
                $(this).parent().next().find(".pa_onglet4").addClass("visible").siblings().removeClass("visible")
            } else if ($(this).hasClass("pa_onglet5")) {
                $(this).parent().next().find(".pa_onglet5").addClass("visible").siblings().removeClass("visible")
            } else if ($(this).hasClass("pa_onglet6")) {
                $(this).parent().next().find(".pa_onglet6").addClass("visible").siblings().removeClass("visible")
            } else if ($(this).hasClass("pa_onglet7")) {
                $(this).parent().next().find(".pa_onglet7").addClass("visible").siblings().removeClass("visible")
            } else {
                $(this).parent().next().find(".pa_onglet8").addClass("visible").siblings().removeClass("visible")
            }
        })
    })
});
$(function() {
    $.each($('.profil_all'), function(index, value) {
        var color_gp = $(this).find('.profil_name h1 span').css('color');
        if (typeof (color_gp) != "undefined") {
            $(this).find('.profil_rank').css('color', color_gp);
            $(this).find('.profil_online b').css('background-color', color_gp)
        }
    })
});
$(function() {
    var cards = $(".pa_top20img");
    for (var i = 0; i < cards.length; i++) {
        var target = Math.floor(Math.random() * cards.length - 1) + 1;
        var target2 = Math.floor(Math.random() * cards.length - 1) + 1;
        cards.eq(target).before(cards.eq(target2))
    }
});
!window.fa_mentionner && !/\/privmsg|\/profile\?mode=editprofile&page_profil=signature/.test(window.location.href) && $(function() {
    $(function() {
        var container = $('.sceditor-container')[0], text_editor = document.getElementById('text_editor_textarea'), frame, instance;
        if (container && text_editor) {
            frame = $('iframe', container);
            instance = $(text_editor).sceditor('instance');
            window.fa_mentionner = {
                suggest_delay: 100,
                lang: {
                    placeholder: 'Searching...',
                    not_found: 'User not found'
                },
                color: {
                    font: '#333',
                    hover_font: '#FFF',
                    error_font: '#F00',
                    background: '#FFF',
                    hover_background: '#69C',
                    border: '#CCC',
                    shadow: 'rgba(0, 0, 0, 0.176)'
                },
                instance: instance,
                rangeHelper: instance.getRangeHelper(),
                frame: frame[0],
                body: frame.contents().find('body')[0],
                textarea: $('textarea', container)[0],
                faux_textarea: $('<div id="faux_text_editor" />')[0],
                list: $('<div id="fa_mention_suggestions" style="position:absolute;" />')[0],
                selectors: $('.bodyline')[0] ? ['a.gen[href^="/u"]', '.member-vava a'] : document.getElementById('ipbwrapper') ? ['.membername', '.member-vava'] : null,
                adjustScroll: function() {
                    fa_mentionner.faux_textarea.scrollTop = fa_mentionner.textarea.scrollTop
                },
                updateFauxTextarea: function(active, key) {
                    if (key == 16) {
                        return
                    }
                    if (active != true) {
                        fa_mentionner.clearSuggestions()
                    } else {
                        return
                    }
                    if (!fa_mentionner.instance.inSourceMode()) {
                        key != 32 ? fa_mentionner.searchWYSIWYG() : fa_mentionner.clearSuggestions();
                        return
                    }
                    var val = fa_mentionner.instance.val(), range = 0, selection, faux_caret, username;
                    if (fa_mentionner.faux_textarea.style.height != fa_mentionner.textarea.style.height || fa_mentionner.faux_textarea.style.width != fa_mentionner.textarea.style.width) {
                        fa_mentionner.faux_textarea.style.height = fa_mentionner.textarea.style.height;
                        fa_mentionner.faux_textarea.style.width = fa_mentionner.textarea.style.width
                    }
                    if (document.selection) {
                        selection = document.selection.createRange();
                        selection.moveStart('character', -fa_mentionner.textarea.length);
                        range = selection.text.length
                    } else if (fa_mentionner.textarea.selectionStart || fa_mentionner.textarea.selectionStart == 0) {
                        range = fa_mentionner.textarea.selectionStart
                    }
                    val = val.slice(0, range) + '{FAUX_CARET}' + val.slice(range, val.length);
                    $(fa_mentionner.faux_textarea).html(val.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/@"(.*?)"|@(.*?)(?:\s|\r|\n|$)/g, function(M, $1, $2) {
                        var lastChar = M.substr(-1)
                          , name = ($1 || $2 || '').replace(/\{FAUX_CARET\}|"/g, '');
                        return '<a href="#' + name + '">' + (/\s|\r|\n/.test(M) ? M.slice(0, M.length - 1) + '</a>' + lastChar : M + '</a>')
                    }).replace(/\{FAUX_CARET\}/, '<span id="faux_caret" style="position:absolute;margin-left:-3px;">|</span>'));
                    faux_caret = document.getElementById('faux_caret');
                    if (faux_caret && faux_caret.parentNode.tagName == 'A') {
                        fa_mentionner.value = val;
                        fa_mentionner.delay = window.setTimeout(function() {
                            fa_mentionner.suggest(faux_caret.parentNode.href.replace(/.*?#(.*)/, '$1'), $(faux_caret).offset())
                        }, fa_mentionner.suggest_delay)
                    }
                    fa_mentionner.adjustScroll()
                },
                searchWYSIWYG: function() {
                    var selected = fa_mentionner.rangeHelper.cloneSelected(), mentions = selected.startContainer.data && selected.startContainer.data.match(/(@".*?")|(@.*?)(?:\s|\r|\n|$)/g), offset, offset_marker, hit, i;
                    console.log(mentions);
                    if (mentions && mentions[0]) {
                        for (i in mentions) {
                            mentions[i] = mentions[i].replace(/\s$/g, '')
                        }
                        for (i in mentions) {
                            if (!fa_mentionner.wysiwyg_mentions || (mentions[i] != fa_mentionner.wysiwyg_mentions[i])) {
                                hit = true;
                                fa_mentionner.delay = window.setTimeout(function() {
                                    fa_mentionner.rangeHelper.insertMarkers();
                                    offset = $(fa_mentionner.frame).offset();
                                    offset_marker = $('#sceditor-end-marker', fa_mentionner.body).show().offset();
                                    offset.left += offset_marker.left;
                                    offset.top += offset_marker.top - fa_mentionner.body.scrollTop;
                                    fa_mentionner.suggest(mentions[i].slice(1).replace(/^"|"$/g, ''), offset, true);
                                    fa_mentionner.wysiwyg_active = mentions[i]
                                }, fa_mentionner.suggest_delay);
                                break
                            }
                        }
                        if (!hit) {
                            fa_mentionner.list.style.display = 'none';
                            fa_mentionner.focused = null
                        }
                        fa_mentionner.wysiwyg_mentions = mentions
                    }
                },
                suggest: function(username, offset, wysiwyg) {
                    fa_mentionner.list.innerHTML = '<span class="fam-info">' + fa_mentionner.lang.placeholder + '</span>';
                    $(fa_mentionner.list).css({
                        left: offset.left + 'px',
                        top: offset.top + 'px',
                        display: 'block',
                        overflowY: 'auto'
                    });
                    document.body.appendChild(fa_mentionner.list);
                    fa_mentionner.request = $.get('/memberlist?username=' + username, function(d) {
                        fa_mentionner.request = null;
                        var suggestion = $(fa_mentionner.selectors ? fa_mentionner.selectors[0] : '.avatar-mini a', d), ava = fa_mentionner.selectors ? $(fa_mentionner.selectors[1], d) : null, i = 0, j = suggestion.length, name;
                        fa_mentionner.list.innerHTML = '';
                        if (j) {
                            for (; i < j; i++) {
                                name = $(suggestion[i]).text().replace(/^\s+|\s+$/g, '');
                                fa_mentionner.list.insertAdjacentHTML('beforeend', '<a href="javascript:fa_mentionner.finish(\'' + name.replace(/'/g, '\\\'') + '\', ' + wysiwyg + ');" class="fa_mention_suggestion">' + '<img class="fa_suggested_avatar" src="' + $(fa_mentionner.selectors ? ava[i] : suggestion[i]).find('img').attr('src') + '"/>' + '<span class="fa_suggested_name">' + name + '</span>' + '</a>')
                            }
                            fa_mentionner.list.style.overflowY = j > 7 ? 'scroll' : 'auto';
                            fa_mentionner.list.firstChild.className += ' fam-focus';
                            fa_mentionner.focused = fa_mentionner.list.firstChild;
                            fa_mentionner.scrollSuggestions()
                        } else {
                            fa_mentionner.list.innerHTML = '<span class="fam-info" style="color:' + fa_mentionner.color.error_font + ';">' + fa_mentionner.lang.not_found + '</span>'
                        }
                    })
                },
                clearSuggestions: function() {
                    if (fa_mentionner.delay) {
                        window.clearTimeout(fa_mentionner.delay);
                        fa_mentionner.delay = null;
                        fa_mentionner.list.style.display = 'none';
                        fa_mentionner.focused = null
                    }
                    if (fa_mentionner.request) {
                        fa_mentionner.request.abort();
                        fa_mentionner.request = null
                    }
                },
                finish: function(username, wysiwyg) {
                    var mention, index, i;
                    fa_mentionner.clearSuggestions();
                    fa_mentionner.focused = null;
                    fa_mentionner.list.style.display = 'none';
                    if (!wysiwyg) {
                        fa_mentionner.value = fa_mentionner.value.replace(/(?:@".[^"]*?\{FAUX_CARET\}.*?"|@\{FAUX_CARET\}.*?(\s|\n|\r|$)|@.[^"\s]*?\{FAUX_CARET\}.*?(\s|\n|\r|$))/, function(M, $1, $2) {
                            mention = '@"' + username + '"';
                            return '{MENTION_POSITION}' + ($1 ? $1 : $2 ? $2 : '')
                        });
                        index = fa_mentionner.value.indexOf('{MENTION_POSITION}');
                        fa_mentionner.value = fa_mentionner.value.replace('{MENTION_POSITION}', '');
                        fa_mentionner.scrollIndex = fa_mentionner.textarea.scrollTop;
                        fa_mentionner.instance.val('');
                        fa_mentionner.instance.insert(fa_mentionner.value.slice(0, index) + mention, fa_mentionner.value.slice(index, fa_mentionner.value.length));
                        fa_mentionner.textarea.scrollTop = fa_mentionner.scrollIndex;
                        fa_mentionner.adjustScroll();
                        fa_mentionner.updateFauxTextarea()
                    } else {
                        fa_mentionner.rangeHelper.saveRange();
                        fa_mentionner.body.innerHTML = fa_mentionner.body.innerHTML.replace(new RegExp(fa_mentionner.wysiwyg_active.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '(<span.*?id="sceditor-end-marker".*?>)'), '@"' + username + '"$1');
                        fa_mentionner.body.focus();
                        fa_mentionner.rangeHelper.restoreRange();
                        for (i in fa_mentionner.wysiwyg_mentions) {
                            if (fa_mentionner.wysiwyg_mentions[i] == fa_mentionner.wysiwyg_active) {
                                fa_mentionner.wysiwyg_mentions[i] = '@"' + username + '"';
                                break
                            }
                        }
                    }
                },
                scrollSuggestions: function() {
                    $(fa_mentionner.list).scrollTop(($(fa_mentionner.focused).offset().top - $(fa_mentionner.list).offset().top + $(fa_mentionner.list).scrollTop()) - (26 * 3))
                }
            };
            for (var css = window.getComputedStyle(fa_mentionner.textarea, null), i = 0, j = css.length, str = ''; i < j; i++) {
                str += css[i] + ':' + css.getPropertyValue(css[i]) + ';'
            }
            $('head').append('<style type="text/css">' + '#faux_text_editor {' + str + '}' + '#faux_text_editor { position:absolute; left:0; bottom:0; z-index:-1; visibility:hidden; display:block; overflow-y:auto; width:100%; }' + '#fa_mention_suggestions { color:' + fa_mentionner.color.font + '; font-size:10px; font-family:arial, verdana, sans-serif; background:' + fa_mentionner.color.background + '; border:1px solid ' + fa_mentionner.color.border + '; margin-top:20px; z-index:999; max-height:182px; overflow-x:hidden; box-shadow:0 6px 12px ' + fa_mentionner.color.shadow + '; }' + 'a.fa_mention_suggestion, .fam-info { color:' + fa_mentionner.color.font + '; height:26px; line-height:26px; padding:0 3px; display:block; white-space:nowrap; cursor:pointer; }' + 'a.fa_mention_suggestion.fam-focus { color:' + fa_mentionner.color.hover_font + '; background:' + fa_mentionner.color.hover_background + '; }' + '.fa_suggested_avatar { height:20px; width:20px; vertical-align:middle; margin-right:3px; }' + 'a.fa_mention_suggestion, .fa_suggested_name { transition:none; }' + '</style>');
            fa_mentionner.textarea.parentNode.insertBefore(fa_mentionner.faux_textarea, fa_mentionner.textarea);
            fa_mentionner.textarea.onclick = fa_mentionner.updateFauxTextarea;
            fa_mentionner.textarea.onscroll = fa_mentionner.adjustScroll;
            fa_mentionner.instance.keyUp(function(e) {
                if (fa_mentionner.focused && e && (e.keyCode == 13 || e.keyCode == 38 || e.keyCode == 40)) {
                    fa_mentionner.updateFauxTextarea(true, e.keyCode);
                    return false
                } else {
                    fa_mentionner.updateFauxTextarea(false, e.keyCode)
                }
            });
            $([document, fa_mentionner.body]).on('keydown', function(e) {
                var that = e.target;
                if (fa_mentionner.focused && e && e.keyCode && (that.tagName == 'TEXTAREA' || that.tagName == 'BODY')) {
                    if (e.keyCode == 40) {
                        var next = fa_mentionner.focused.nextSibling;
                        if (next) {
                            $(fa_mentionner.focused).removeClass('fam-focus');
                            next.className += ' fam-focus';
                            fa_mentionner.focused = next;
                            fa_mentionner.scrollSuggestions()
                        }
                        return false
                    }
                    if (e.keyCode == 38) {
                        var prev = fa_mentionner.focused.previousSibling;
                        if (prev) {
                            $(fa_mentionner.focused).removeClass('fam-focus');
                            prev.className += ' fam-focus';
                            fa_mentionner.focused = prev;
                            fa_mentionner.scrollSuggestions()
                        }
                        return false
                    }
                    if (e.keyCode == 13) {
                        fa_mentionner.focused.click();
                        return false
                    }
                }
            });
            $(document).on('mouseover', function(e) {
                var that = e.target;
                if (/fa_mention_suggestion/.test(that.className)) {
                    $(fa_mentionner.focused).removeClass('fam-focus');
                    that.className += ' fam-focus';
                    fa_mentionner.focused = that
                }
            })
        }
    })
});
$(function() {
    var version = 0
      , texte = '@';
    if (/mode=reply/.test(window.location.search) && my_getcookie('fa_mention')) {
        document.post.message.value += '@"' + my_getcookie('fa_mention') + '" ';
        my_setcookie('fa_mention', '')
    }
    if (!/\/t\d+/.test(window.location.pathname))
        return;
    for (var a = $(['.sujet_options', '.sujet_options2'][version]), b, c, d = ['#pseudo a', '.name strong a', '.author a', '.username a', '.author a', '.postprofile-name a'][version], e, i = 0, j = a.length, t = document.getElementById('text_editor_textarea'), l = version == 1 || version == 3 || version == 4; i < j; i++) {
        b = document.createElement('A');
        b.text = texte;
        b.alt = 'Mentionner';
        b.title = 'Mentionner ' + $(a[i]).closest('.post').find(d + ':not(.fa-mention)').text();
        b.className = 'i_icon_mention';
        b.onclick = function() {
            var n = this.title.replace(/^.*?\s/, '');
            if ($.sceditor)
                t.insertText('@"' + n + '"');
            else {
                my_setcookie('fa_mention', n);
                window.location.href = '/post?t=' + window.location.pathname.replace(/\/t(\d+)-.*/, '$1') + '&mode=reply'
            }
        }
        ;
        if (l) {
            c = document.createElement('LI');
            c.appendChild(b)
        }
        a[i].insertBefore(l ? c : b, a[i].firstChild)
    }
    $(function() {
        if (!$.sceditor)
            return;
        t = $(t).sceditor('instance')
    })
});
$(function() {
    $(function() {
        $('#fa_welcome').text(_userdata.username)
    })
});
var wordcount_signaled = false;
$(function() {
    if (!$('#text_editor_textarea').length || !$.fn["sceditor"])
        return;
    $(function() {
        var e = $('#text_editor_textarea').sceditor('instance');
        if (!e)
            return;
        var w = $('<div class="word-count"></div>').insertAfter('.sceditor-container');
        var wc = function() {
            var t = e.val().replace(/\[.*?\]/g, ' ').replace(/<.*?>/g, ' ').replace(/[\x00-\x40\x5b-\x60\x7b-\x7e]/g, ' ');
            w.html('<rod><u>caractères</u>   ' + (t.match(/\S/g) || []).length + ' - <u>Mots</u>   ' + (t.match(/\S{1,}/g) || []).length);
            wordcount_signaled = false
        };
        e.keyDown(function() {
            if (wordcount_signaled)
                return;
            wordcount_signaled = true;
            setTimeout(function() {
                wc()
            }, 2000)
        });
        wc()
    })
});
$(function() {
    $("body").append('<div class="boutonhautbas"><a href="#top"><div class="top"><i class="bi bi-chevron-up"></i></div></a> <a href="#bottom"><div class="bottom"><i class="bi bi-chevron-down"></i></div></a></div>')
});
if (/^\/u/.test(location.pathname))
    $(function() {
        $('.profil_links a[href^="/profile?mode=email&u"]').closest('dl').remove();
        $(this).find('.separator:first').remove()
    });
function selectCode(e) {
    var s = $(e).closest("dl").find(".cont_code,code").get(0), range, selection;
    var a = s
      , z = s;
    while (a.nodeType == 1 && a.childNodes.length)
        a = a.firstChild;
    while (z.nodeType == 1 && z.childNodes.length)
        z = z.lastChild;
    if (!$(a).is('.fixff')) {
        var fix = $('<span class="fixff"/>').insertBefore(a)
    } else {
        a = a.nextSibling
    }
    if (document.body.createTextRange) {
        range = document.body.createTextRange();
        range.moveToElementText(s);
        range.select()
    } else if (window.getSelection) {
        selection = window.getSelection();
        range = document.createRange();
        range.setStart(a, 0);
        range.setEnd(z, z.nodeValue ? z.nodeValue.length : 0);
        selection.removeAllRanges();
        selection.addRange(range)
    }
}
;$(function() {
    $("dl.codebox:not(.spoiler,.hidecode)  > dd.code, dl.codebox:not(.spoiler,.hidecode)  > dd > code").closest("dl").find('dt').append('<span onClick="selectCode(this)" class="selectCode">Sélectionner</span>')
});
