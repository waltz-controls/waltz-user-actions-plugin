/**
 *
 * @module UserLog
 * @memberof ui
 * @author Igor Khokhriakov <igor.khokhriakov@hzg.de>
 * @since 9/10/18
 */
const user_log = webix.protoUI({
    name: 'user_log',
    ui() {
        return {
            /**
             *
             * @param {UserAction} action
             * @return {string}
             */
            template(action) {
                return `<div>${action.hasFailed() ? '<span class="webix_icon red mdi mdi-alert"></span>' : ''}${new Date(action.id)}</div>${action.redoable ? '<span class="redo webix_icon mdi mdi-redo-variant"></span>' : ''}${action.message}`;
            }
        }
    },
    $init(config) {
        webix.extend(config, this.ui());

        this.$ready.push(() => {
            this.data.sync(config.root.actions);
        })
    },
    defaults: {
        limit: 25,
        type: {
            height: Infinity
        }
    }
}, webix.ui.list);
