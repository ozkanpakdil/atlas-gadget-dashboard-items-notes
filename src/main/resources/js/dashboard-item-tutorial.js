define('dashboard-items/tutorial', ['underscore', 'jquery', 'wrm/context-path'], function (_, $, contextPath) {
    var DashboardItem = function (API) {
        this.API = API;
        this.issues = [];
    };
    /**
     * Called to render the view for a fully configured dashboard item.
     *
     * @param context The surrounding <div/> context that this items should render into.
     * @param preferences The user preferences saved for this dashboard item (e.g. filter id, number of results...)
     */
    DashboardItem.prototype.render = function (context, preferences) {
        this.API.showLoadingBar();
        var $element = this.$element = $(context).find("#dynamic-content");
        var self = this;
        this.requestData(preferences).done(function (data) {
            self.API.hideLoadingBar();
            self.issues = data.issues;
            if (self.issues === undefined || self.issues.length  === 0) {
                $element.empty().html(Dashboard.Item.Tutorial.Templates.Empty());
            }
            else {
                $element.empty().html(Dashboard.Item.Tutorial.Templates.IssueList({issues: self.issues}));
            }
            self.API.resize();
            $element.find(".submit").click(function (event) {
                event.preventDefault();
                self.render(context, preferences);
            });
        });

        this.API.once("afterRender", this.API.resize);
    };

    DashboardItem.prototype.requestData = function (preferences) {
        return $.ajax({
            method: "GET",
            url: contextPath() + "/rest/api/2/search?maxResults=10&jql=due<=" + preferences['due-date-input']
        });
    };



    DashboardItem.prototype.renderEdit = function (context, preferences) {
        var $element = this.$element = $(context).find("#dynamic-content");
        $element.empty().html(Dashboard.Item.Tutorial.Templates.Configuration());
        this.API.once("afterRender", this.API.resize);
        var $form = $("form", $element);
        $(".cancel", $form).click(_.bind(function() {
            if(preferences['due-date-input'])
                this.API.closeEdit();
        }, this));

        $form.submit(_.bind(function(event) {
            event.preventDefault();

            var preferences = getPreferencesFromForm($form);
            var regexp = /^\d+([dwm])$/;
            if(regexp.test(preferences['due-date-input'])) {
                this.API.savePreferences(preferences);
                this.API.showLoadingBar();
            }
        }, this));
    };

    function getPreferencesFromForm($form) {
        var preferencesArray = $form.serializeArray();
        var preferencesObject = {};

        preferencesArray.forEach(function(element) {
            preferencesObject[element.name] = element.value;
        });

        return preferencesObject;
    }


    return DashboardItem;
});