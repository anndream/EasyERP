﻿define([
    "text!templates/Users/EditTemplate.html",
    "custom",
    "common",
    "dataService"
],
    function (EditTemplate, Custom, common,dataService) {
        var EditView = Backbone.View.extend({
            el: "#content-holder",
            contentType: "Users",
            imageSrc: '',
            template: _.template(EditTemplate),

            initialize: function (options) {
                _.bindAll(this, "saveItem");
                this.collection = options.collection;
                this.currentModel = this.collection.getElement();
                this.render();
            },
            hideDialog: function () {
                $(".edit-dialog").remove();
            },
            saveItem: function () {
                var self = this;

                var mid = 39;
                var data = {
                    imageSrc: this.imageSrc,
                    email: $('#email').val(),
                    login: $('#login').val(),
                    profile: {
                        company: {
                            id: $('#companiesDd option:selected').val(),
                            name: $('#companiesDd option:selected').text()
                        },
                        profile: {
                            id: $('#profilesDd option:selected').val(),
                            name: $('#profilesDd option:selected').text()
                        }
                    }
                };

                this.currentModel.save(data, {
                    headers: {
                        mid: mid
                    },
                    wait: true,
                    success: function (model, responseText) {
                        self.hideDialog();
                        Backbone.history.navigate("home/content-" + self.contentType, { trigger: true });
                    },
                    error: function () {
                        Backbone.history.navigate("home", { trigger: true });
                    },
                    confirmPass: $('#confirmpassword').val(),
                    editMode: true
                });


            },

            render: function () {
                var formString = this.template(this.currentModel.toJSON());
                var self = this;
                this.$el = $(formString).dialog({
                    dialogClass: "edit-dialog",

                    title: "Edit User",
                    buttons:{
                        save:{
                            text:"Save",
                            class:"btn",
                            click: self.saveItem
                        },
                        cancel:{
                            text:"Cancel",
                            class:"btn",
                            click: function(){
                                self.hideDialog();
                            }
                        }
                    }
                });
                common.populateCompanies(App.ID.companiesDd, "/Companies");
                common.populateProfilesDd(App.ID.profilesDd, "/Profiles");
                common.canvasDraw({ model: this.model.toJSON() }, this);
                return this;
            }

        });

        return EditView;
    });