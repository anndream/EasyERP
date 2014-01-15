﻿define([
        'text!templates/Applications/kanban/WorkflowsTemplate.html',
        'collections/Workflows/WorkflowsCollection',
        'views/Applications/kanban/KanbanItemView',
        'views/Applications/EditView',
        'views/Applications/CreateView',
        'models/ApplicationsModel'
],
function (WorkflowsTemplate, WorkflowsCollection, ApplicationKanbanItemView, EditView, CreateView,CurrentModel) {
    var ApplicationKanbanView = Backbone.View.extend({
        el: '#content-holder',
        events: {
            "click #showMore": "showMore",
            "dblclick .item": "gotoEditForm",
            "click .application-header, .application-content": "selectItem"
        },
        initialize: function (options) {
			this.startTime = options.startTime;
            this.workflowsCollection = new WorkflowsCollection({ id: 'Application' });
            this.workflowsCollection.bind('reset', this.render, this);
            this.collection = options.collection;
        },

        selectItem: function (e) {
            $(e.target).parents(".item").parent().find(".active").removeClass("active");
            $(e.target).parents(".item").addClass("active");
        },

        gotoEditForm: function (e) {
            e.preventDefault();
            var id = $(e.target).closest(".inner").data("id");
//            var model = this.collection.getElement(id);
            var model = new CurrentModel();
            model.urlRoot = '/Applications/form';
            model.fetch({
                data: { id: id },
                success: function (model, response, options) {
                    new EditView({ model: model });
                },
                error: function () { alert('Please refresh browser'); }
            });

//            new EditView({ model: model, collection: this.collection });
        },
        
       /* filterByWorkflow: function (models, id) {
            return _.filter(models, function (data) {
                return data.attributes["workflow"]._id == id;
            });
        },*/

        showMore: function () {
            _.bind(this.collection.showMore, this.collection);
            this.collection.showMore();
        },

        showMoreContent: function (newModels) {
            /*var workflows = this.workflowsCollection.toJSON();
            $(".column").last().addClass("lastColumn");
            _.each(workflows, function (workflow, i) {
                var counter = 0,
                remaining = 0;
                var column = this.$(".column").eq(i);
                var kanbanItemView;
                var modelByWorkflows = this.filterByWorkflow(newModels.models, workflow._id);
                _.each(modelByWorkflows, function (wfModel) {
                    kanbanItemView = new ApplicationKanbanItemView({ model: wfModel });
                    column.append(kanbanItemView.render().el);
                    counter++;
                    remaining += wfModel.get("remaining");
                }, this);
                column.find(".counter").html(parseInt(column.find(".counter").html()) + counter);
                column.find(".remaining span").html(parseInt(column.find(".remaining span").html()) + remaining);
            }, this);*/
            var workflows = this.workflowsCollection.toJSON();

            $(".column").last().addClass("lastColumn");
            _.each(workflows, function (workflow, i) {
                var column = this.$(".column").eq(i);
                var kanbanItemView;
                var modelByWorkflows = newModels.filterByWorkflow(workflow._id);
                _.each(modelByWorkflows, function (wfModel) {
                    kanbanItemView = new ApplicationKanbanItemView({ model: wfModel });
                    var model_id = wfModel.get('_id');
                    if (this.collection.get(model_id) === undefined) {
                        column.append(kanbanItemView.render().el);
                    } else {
                        $( "#"+ wfModel.get('_id')).hide();
                        column.append(kanbanItemView.render().el);
                    }
                    column.append(kanbanItemView.render().el);
                }, this);
            }, this);
            this.collection.add(newModels.models);

            if (!this.collection.showMoreButton) {
                $('#showMoreDiv').hide();
            }
        },

        editItem: function () {
            //create editView in dialog here
            new EditView({ collection: this.collection });
        },

        createItem: function () {
            //create editView in dialog here
            new CreateView();
        },

        render: function () {

            var workflows = this.workflowsCollection.toJSON();
            this.$el.html(_.template(WorkflowsTemplate, { workflowsCollection: workflows }));
            $(".column").last().addClass("lastColumn");
            var ApplicationCount;

            _.each(workflows, function (workflow, i) {
                ApplicationCount = 0
                ApplicationRemaining = 0;
                _.each(this.collection.optionsArray, function(wfId){
                    if (wfId._id == workflow._id) {
                        ApplicationCount = wfId.count;
                    }
                });
                var column = this.$(".column").eq(i);
                var kanbanItemView;
                var modelByWorkflows = this.collection.filterByWorkflow(workflow._id);

                _.each(modelByWorkflows, function (wfModel) {
                    kanbanItemView = new ApplicationKanbanItemView({ model: wfModel });
                    column.append(kanbanItemView.render().el);
                }, this);
                var count = " <span>(<span class='counter'>" + ApplicationCount + "</span>)</span>";
                column.find(".columnNameDiv h2").append(count);
            }, this);
            var that = this;

            if (this.collection.showMoreButton) {
                this.$el.append('<div id="showMoreDiv"><input type="button" id="showMore" value="Show More"/></div>');
            }

            this.$(".column").sortable({
                connectWith: ".column",
                cancel: "h2",
                cursor: "move",
                items: ".item",
                opacity: 0.7,
                revert: true,
                helper: 'clone',
                start: function (event, ui) {
                    var column = ui.item.closest(".column");
                    var id = ui.item.context.id;
                    var model = that.collection.get(id);
                    if (model) {
                        column.find(".counter").html(parseInt(column.find(".counter").html()) - 1);
                        //column.find(".remaining span").html(parseInt(column.find(".remaining span").html()) - (model.get("estimated") - model.get("logged")));
                    }

                },
                stop: function (event, ui) {
                	var id = ui.item.context.id;
                    var model = that.collection.get(id);
                    var column = ui.item.closest(".column");
                    if (model) {
                        model.save({workflow: column.data('id')}, {
                            //headers: {
                            //    mid: mid
                            //}
                        });
                        column.find(".counter").html(parseInt(column.find(".counter").html()) + 1);
                        //column.find(".remaining span").html(parseInt(column.find(".remaining span").html()) + (model.get("estimated") - model.get("logged")));
                    }
                }
            }).disableSelection();
			this.$el.append("<div id='timeRecivingDataFromServer'>Created in "+(new Date()-this.startTime)+" ms</div>");
            return this;
        }
    });

    return ApplicationKanbanView;
});
