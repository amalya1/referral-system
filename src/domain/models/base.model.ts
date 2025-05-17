export interface BaseProps {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export abstract class BaseModel<T extends BaseProps> {
  protected props: T;

  constructor(props: T) {
    const now = new Date();
    this.props = {
      ...props,
      createdAt: props.createdAt || now,
      updatedAt: props.updatedAt || now
    } as T;
  }

  abstract get id(): string;

  get createdAt(): Date {
    return this.props.createdAt!;
  }

  get updatedAt(): Date {
    return this.props.updatedAt!;
  }
}
