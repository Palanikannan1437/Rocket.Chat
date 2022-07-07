import { Match, check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { LivechatVisitors } from '@rocket.chat/models';

import { API } from '../../../../api/server';
import { Contacts } from '../../lib/Contacts';
import { LivechatCustomField } from '@rocket.chat/models';

API.v1.addRoute(
	'omnichannel/contact',
	{ authRequired: true },
	{
		async post() {
			try {
				check(this.bodyParams, {
					_id: Match.Maybe(String),
					token: String,
					name: String,
					email: Match.Maybe(String),
					phone: Match.Maybe(String),
					customFields: Match.Maybe(Object),
					contactManager: Match.Maybe({
						username: String,
					}),
				});

				const contact = await Contacts.registerContact(this.bodyParams);

				return API.v1.success({ contact });
			} catch (e) {
				return API.v1.failure(e);
			}
		},
		async get() {
			check(this.queryParams, {
				contactId: String,
			});

			const contact = await LivechatVisitors.findOneById(this.queryParams.contactId);

			return API.v1.success({ contact });
		},
	},
);

API.v1.addRoute(
	'omnichannel/contact.search',
	{ authRequired: true },
	{
		async get() {
			try {
				check(this.queryParams, {
					email: Match.Maybe(String),
					phone: Match.Maybe(String),
					custom: Match.Maybe(String),
				});
				const { email, phone, custom } = this.queryParams;

				if (!email && !phone && !custom) {
					throw new Meteor.Error('error-invalid-params');
				}
				const allowedCF = LivechatCustomField.find({ scope: 'visitor' }, { fields: { _id: 1 } }, { searchability: true }).map(
					({ _id }) => _id,
				);
				const customObj = Object.fromEntries(Array.from(new URLSearchParams(custom)).filter(([k]) => allowedCF.includes(k)));
				const query = Object.assign(
					{},
					{
						...(email && { visitorEmails: { address: email } }),
						...(phone && { phone: { phoneNumber: phone } }),
						...(custom && { livechatData: customObj }),
					},
				);

				const contact = await LivechatVisitors.findOne(query);
				return API.v1.success({ contact });
			} catch (e) {
				return API.v1.failure(e);
			}
		},
	},
);
