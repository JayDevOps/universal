
import { ServerModule } from '@angular/platform-server';
import { NgModule, Component } from '@angular/core';
import 'zone.js';

import { BrowserModule } from '@angular/platform-browser';
import { startGRPCEngine } from '@nguniversal/grpc-engine';
import {load, credentials} from 'grpc';

function createClient() {
  const engineProto = load('../grpc-engine.proto').GRPCEngine;
  const client = engineProto.SSR('localhost:9090', credentials.createInsecure());
  return client;
}

export function makeTestingModule(template: string, component?: any): any {
  @Component({
    selector: 'root',
    template: template
  })
  class MockComponent {}
  @NgModule({
    imports: [ServerModule, BrowserModule.withServerTransition({appId: 'mock'})],
    declarations: [component || MockComponent],
    bootstrap: [component || MockComponent]
  })
  class MockServerModule {}
  return MockServerModule;
}

describe('test runner', () => {
  it('should render a basic template', async (done) => {
    const template = `some template: ${new Date()}`;
    const appModule = makeTestingModule(template);
    const server = await startGRPCEngine(appModule);
    const client = createClient();

    client.render({id: 1, document: '<root></root>'}, async(_err: any, response: any) => {
      expect(response.html).toContain(template);
      await server.close();
      done();
    });
  });
});
