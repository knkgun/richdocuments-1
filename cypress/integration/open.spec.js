/**
 * @copyright Copyright (c) 2019 John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

describe('Open test.md in viewer', function() {

	before(function() {
		cy.login()

		cy.uploadFile('document.odt', 'application/vnd.oasis.opendocument.text')
		cy.uploadFile('spreadsheet.ods', 'application/vnd.oasis.opendocument.spreadsheet')
		cy.uploadFile('presentation.odp', 'application/vnd.oasis.opendocument.presentation')
		cy.uploadFile('drawing.odg', 'application/vnd.oasis.opendocument.drawing')
	})

	after(function() {
		cy.logout()
	})

	const fileTests = ['document.odt', 'presentation.odp', 'spreadsheet.ods', 'drawing.odg']
	fileTests.forEach((filename) => {

		it('Open ' + filename + ' the viewer on file click', function() {
			cy.visit('/apps/files', {
				onBeforeLoad(win) {
					cy.spy(win, 'postMessage').as('postMessage')
				},
			})
			cy.openFile(filename)

			cy.get('#viewer', { timeout: 15000 })
				.should('be.visible')
				.and('have.class', 'modal-mask')
				.and('not.have.class', 'icon-loading')

			cy.get('#collaboraframe').iframe().should('exist').as('collaboraframe')
			cy.get('@collaboraframe').within(() => {
				cy.get('#loleafletframe').iframe().should('exist').as('loleafletframe')
			})

			cy.get('@loleafletframe').find('#main-document-content').should('exist')

			// FIXME: wait for collabora to load (sidebar to be hidden)
			// FIXME: handle welcome popup / survey

			cy.screenshot('open-file_' + filename)

			// Share action
			cy.get('@loleafletframe').within(() => {
				cy.get('#main-menu #menu-file > a').click()
				cy.get('#main-menu #menu-shareas > a').click()
			})

			cy.get('#app-sidebar-vue')
				.should('be.visible')
			cy.get('.app-sidebar-header__maintitle')
				.should('be.visible')
				.should('contain.text', filename)
			// FIXME: wait for sidebar tab content
			// FIXME: validate sharing tab
			cy.screenshot('share-sidebar_' + filename)

			// Validate closing
			cy.get('@loleafletframe').within(() => {
				cy.get('#closebutton').click()
			})
			cy.get('#viewer', { timeout: 5000 }).should('not.exist')
		})
	})
})
