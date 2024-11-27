export const createAsyncStub = <T = void>(
  delay = 300,
  returnValue?: T
): Cypress.Agent<sinon.SinonStub<unknown[], Promise<T>>> => {
  const stub = cy.stub();
  stub.callsFake(
    () =>
      new Promise((resolve) => setTimeout(() => resolve(returnValue), delay))
  );
  return stub;
};
