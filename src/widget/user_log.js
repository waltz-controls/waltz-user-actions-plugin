import '../view/user_log'
import {WaltzWidget} from "@waltz-controls/middleware";
import {kControllerUserAction} from "../controller/user_action_controller";
import {kChannelTango} from "@waltz-controls/waltz-tango-rest-plugin";
import {
    ExecuteTangoCommand,
    ReadTangoAttribute,
    ReadTangoPipe,
    UpdateDeviceAlias,
    UpdateTangoAttributeInfo,
    WriteTangoAttribute
} from "../model/user_action";
import {BoundedReverseList} from "@waltz-controls/waltz-webix-extensions";

//from Waltz
const kMainWindow = 'widget:main';
//from Middleware
const kAnyTopic = '*';

export const kWidgetUserLog = 'widget:user_log';

function log(target) {
    return function (action) {
        target.addFirst(action);
    }
}

function getFormatter(action) {
    if (action.toMessage && typeof action.toMessage === 'function') return action;
    if (action.target === 'tango') {
        return new TangoUserActionFormatter(action)
    } else {
        return new UserActionFormatter(action);
    }
}

class UserActionFormatter {
    constructor(action) {
        this.action = action;
    }

    toMessage() {
        return `<span><span class="webix_icon mdi mdi-account"></span><strong>${this.action.user}</strong>
                <div>performs action <strong>${this.action.action}</strong> on <strong>${this.action.target}</strong></div>`;
    }
}

function formatValue(v) {
    return v ? v : "Void";
}

class TangoUserActionFormatter extends UserActionFormatter {
    constructor(action) {
        super(action);
    }

    getTail() {
        switch (this.action.action) {
            case ReadTangoPipe.action:
                return `<div><strong>.read() => ...</strong></div>`;
            case ReadTangoAttribute.action:
                return `<div style="background-color: #D5E7B3"><strong>.read() => ${this.action.data.value}</strong></div>`;
            case WriteTangoAttribute.action:
                return `<div style="background-color: #D5E7B3"><strong>.write(formatValue(${this.action.value})) => formatValue(${this.action.data.value})</strong></div>`;
            case ExecuteTangoCommand.action:
                return `<div style="background-color: #D5E7B3"><strong>.execute(formatValue(${this.action.value})) => formatValue(${this.action.data.output})</strong></div>`;
            case UpdateDeviceAlias.action:
                return `<div><strong>${this.action.remove ? 'removes' : ''} ${this.action.device.id}.alias(${this.action.alias})</strong></div>`;
            case UpdateTangoAttributeInfo.action:
                return `<div><strong>updates info of ${this.action.attribute.id}</strong></div>`;
            default:
                return "";
        }
    }

    toMessage() {
        return `${super.toMessage()}
                <div><ul><li>host: <i>${this.action.tango_id.getTangoHostId()}</i></li>
                         <li>device: <i>${this.action.tango_id.getTangoDeviceName()}</i></li>
                         <li>member: <i>${this.action.tango_id.name}</i></li>
                </ul></div>
                ${this.getTail()}`;
    }

}


/**
 * @type UserLogWidget
 * @extends WaltzWidget
 */
export class UserLogWidget extends WaltzWidget {
    constructor(app) {
        super(kWidgetUserLog, app);

        this.actions = webix.extend(new webix.DataCollection(), BoundedReverseList);

        //TODO pending action
        this.middleware.subscribe(kAnyTopic, kControllerUserAction, action => this.log(action));
        this.middleware.subscribe(kAnyTopic, kChannelTango, action => this.log(action));
    }

    get view() {
        return $$(this.name);
    }

    ui() {
        return {
            view: 'accordionitem',
            body: {
                id: this.name,
                view: 'user_log',
                root: this,
                onClick:
                    {
                        "redo": (ev, id) => {
                            const action = $$(this.name).getItem(id);
                            if (action.redoable)
                                webix.confirm(`<div>Confirm redo action <strong>${action.action}</strong> on <strong>${action.target}</strong>?</div>`, "confirm-warning")
                                    .then(() => {
                                        this.app.getController(kControllerUserAction).submit(Object.assign(action, {id: +new Date()}));
                                    });
                        }
                    }
            }
        }
    }

    /**
     *
     * @param {UserAction} action
     */
    log(action) {
        const formatter = getFormatter(action);
        action.message = formatter.toMessage();
        this.actions.addFirst(action);
    }

    run() {
        const view = $$(this.name) || $$(this.app.getWidget(kMainWindow).rightPanel.addView(this.ui()))
    }
}