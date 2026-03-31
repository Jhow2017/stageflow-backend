export abstract class SubdomainAvailabilityChecker {
    abstract isAvailable(subdomain: string): Promise<boolean>;
}
