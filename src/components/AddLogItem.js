import React from 'react';
import { useForm } from 'react-hook-form';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

export default function AddLogItem({addItem }) {
  const { register, handleSubmit } = useForm();

  return (
    <Card className="mt-5 mb-3">
      <Card.Body>
        <Form onSubmit={handleSubmit(addItem)}>
          <Row className="my-3">
            <Col>
              <Form.Control
                placeholder="Log"
                name="text"
                {...register('text')}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Control
                placeholder="User"
                name="user"
                {...register('user')}
              />
            </Col>
            <Col>
              <Form.Control as="select" {...register('priority')}>
                <option value="0">Select Priority</option>
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </Form.Control>
            </Col>
          </Row>
          <Row className="my-3">
            <Col>
              <Button type="submit" variant="secondary" block>
                Add Log
              </Button>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
}
