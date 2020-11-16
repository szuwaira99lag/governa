import AbstractWhitelistAction from '../../lib/whitelist/AbstractWhitelistAction';
import {ListItem} from '../db/Whitelist'

export default class GetListAction extends AbstractWhitelistAction {
    /**
     * Adds a new item to the whitelist
     * 
     * @method execute
     * 
     * @returns {Promise<boolean>}
     * 
     * @public
     */
    public execute(): Promise<ListItem[]> {
        return Promise.resolve([{publicKey: '0x0', rateLimit: 1}])
    }
}