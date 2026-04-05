import { Entity } from '../../../../core/entities/entity';
import { UniqueEntityID } from '../../../../core/entities/unique-entity-id';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';
export type PaymentMethod = 'PIX' | 'CARD';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

export interface BookingProps {
    studioId: string;
    roomId: string;
    clientId: string;
    bookingDate: Date;
    startHour: number;
    endHour: number;
    totalPrice: number;
    status: BookingStatus;
    paymentMethod: PaymentMethod | null;
    paymentStatus: PaymentStatus;
    paymentRef: string | null;
    mercadoPagoPaymentId: string | null;
    createdAt: Date;
}

export class Booking extends Entity<BookingProps> {
    get studioId(): string {
        return this.props.studioId;
    }

    get roomId(): string {
        return this.props.roomId;
    }

    get clientId(): string {
        return this.props.clientId;
    }

    get bookingDate(): Date {
        return this.props.bookingDate;
    }

    get startHour(): number {
        return this.props.startHour;
    }

    get endHour(): number {
        return this.props.endHour;
    }

    get totalPrice(): number {
        return this.props.totalPrice;
    }

    get status(): BookingStatus {
        return this.props.status;
    }

    get paymentMethod(): PaymentMethod | null {
        return this.props.paymentMethod;
    }

    get paymentStatus(): PaymentStatus {
        return this.props.paymentStatus;
    }

    get paymentRef(): string | null {
        return this.props.paymentRef;
    }

    get mercadoPagoPaymentId(): string | null {
        return this.props.mercadoPagoPaymentId;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    markAsPaid(paymentRef: string): void {
        this.props.paymentStatus = 'PAID';
        this.props.status = 'CONFIRMED';
        this.props.paymentRef = paymentRef;
    }

    markAsFailed(paymentRef: string): void {
        this.props.paymentStatus = 'FAILED';
        this.props.status = 'PENDING';
        this.props.paymentRef = paymentRef;
    }

    assignMercadoPagoPaymentId(mercadoPagoPaymentId: string): void {
        this.props.mercadoPagoPaymentId = mercadoPagoPaymentId;
    }

    static create(props: Omit<BookingProps, 'createdAt'>, id?: UniqueEntityID): Booking {
        return new Booking(
            {
                ...props,
                status: props.status ?? 'CONFIRMED',
                paymentMethod: props.paymentMethod ?? null,
                paymentStatus: props.paymentStatus ?? 'PENDING',
                paymentRef: props.paymentRef ?? null,
                mercadoPagoPaymentId: props.mercadoPagoPaymentId ?? null,
                createdAt: new Date(),
            },
            id,
        );
    }
}
