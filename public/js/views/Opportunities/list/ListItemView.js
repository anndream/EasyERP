﻿define([
    'text!templates/Opportunities/list/ListTemplate.html',
    "common",
    'text!templates/stages.html'
],

	   function (OpportunitiesListTemplate, common, stagesTamplate) {
		   var OpportunitiesListItemView = Backbone.View.extend({
			   el: '#listTable',

			   initialize: function(options) {
				   this.collection = options.collection;
				   this.startNumber = options.startNumber;
			   },
			   events: {
				   "click .stageSelect": "showNewSelect",
				   "click .newSelectList li": "chooseOption"
			   },
	           hideNewSelect: function (e) {
	               $(".newSelectList").hide();;
	           },
	           showNewSelect: function (e) {
	               if ($(".newSelectList").is(":visible")) {
	                   this.hideNewSelect();
	                   return false;
	               } else {
	                   $(e.target).parent().append(_.template(stagesTamplate, { stagesCollection: this.stages }));
	                   return false;
	               }

	           },

	           chooseOption: function (e) {
	               var targetElement = $(e.target).parents("td");
	               var id = targetElement.attr("id");
	               var obj = this.collection.get(id);
				   obj.save({ workflow: $(e.target).attr("id"), workflowStart: targetElement.find(".stageSelect").attr("data-id"), sequence:-1, sequenceStart:targetElement.attr("data-sequence")}, {
	                   headers: {
	                       mid: 39
	                   },
					   patch:true,
	                   success: function (err, model) {
						   targetElement.attr("data-sequence",model.sequence);
						   targetElement.find(".stageSelect").text($(e.target).text()).attr("data-id",$(e.target).attr("id"));
	                   }
	               });

	               this.hideNewSelect();
	               return false;
	           },

	           pushStages: function(stages) {
	               this.stages = stages;
	           },

			   render: function() {
				   var self= this;
				   this.$el.append(_.template(OpportunitiesListTemplate, { opportunitiesCollection: this.collection.toJSON(), startNumber: this.startNumber }));
				   $(document).on("click",function(){
					   self.hideNewSelect();
				   });

			   },
		   });

		   return OpportunitiesListItemView;
	   });
