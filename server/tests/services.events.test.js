import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createEventsService } from '../src/services/events.js';

function makeFakeResponse() {
  const writes = [];
  return {
    writes,
    write(chunk) {
      writes.push(chunk);
    },
    end() {},
  };
}

test('subscribe sends hello event and tracks client count', () => {
  const service = createEventsService();
  const res = makeFakeResponse();
  assert.equal(service.clientCount, 0);

  service.subscribe(res);
  assert.equal(service.clientCount, 1);
  assert.equal(res.writes.length, 1);
  assert.match(res.writes[0], /event: hello/);

  service.close();
});

test('broadcast writes to all subscribed clients', () => {
  const service = createEventsService();
  const a = makeFakeResponse();
  const b = makeFakeResponse();
  service.subscribe(a);
  service.subscribe(b);

  service.broadcast('inquiry-received', { correlationId: 'abc', source: 'contact' });

  const aPayload = a.writes[a.writes.length - 1];
  const bPayload = b.writes[b.writes.length - 1];
  assert.match(aPayload, /event: inquiry-received/);
  assert.match(aPayload, /"correlationId":"abc"/);
  assert.match(bPayload, /event: inquiry-received/);

  service.close();
});

test('unsubscribe stops receiving broadcasts', () => {
  const service = createEventsService();
  const res = makeFakeResponse();
  service.subscribe(res);
  const beforeCount = res.writes.length;
  service.unsubscribe(res);
  service.broadcast('inquiry-received', { ok: true });
  assert.equal(res.writes.length, beforeCount);

  service.close();
});
