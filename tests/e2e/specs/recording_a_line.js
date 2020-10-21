describe('Recording a line', () => {
    it('records', () => {
        cy.visit('/',  {
            onBeforeLoad(win) {
              cy.stub(win, 'prompt').returns('my custom message')
            }
          });

        cy.get('button').contains('Record')
            .click();

        cy.get('button').contains('Stop')
            .click();

        cy.get('div.list-group-item').eq(0).should('contain', 'my custom message')

        cy.get('button').contains('Record')
            .click();

        cy.get('button').contains('Stop')
            .click();

        cy.get('div.list-group-item').eq(1).should('contain', 'my custom message')

        cy.get('button').contains('Record')
            .click();

        cy.get('button').contains('Play Nonstop')
            .click();

    });
});