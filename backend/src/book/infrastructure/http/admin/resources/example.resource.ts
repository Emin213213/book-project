export class ExampleResource {

    id: number;
    message: string;


    public static make(): ExampleResource {
        const resource = new ExampleResource();
        resource.id = 1;
        resource.message = 'Hello';

        return ExampleResource.toArray(resource)
    }

    private static  toArray(resource: ExampleResource) {
        return {
            id: resource.id,
            message: resource.message
        }
    }


}