---
title: "Dependency Injection with Durable Task Framework"
date: "2020-01-19"
---

When using [Durable Task Framework](https://github.com/Azure/durabletask) it's important to be able to use dependency injection in Task Orchestrations and Task Activities.

When calling AddTaskOrchestrations() or AddTaskActivities(), you typically would pass in the Type of Orchestration or Activity that the framework will create when it runs. The key to using dependency injection is to use the overload that accepts an ObjectCreator.

Here is an ObjectCreator that uses the built in .NET Core dependency injection.

```csharp
using DurableTask.Core;
using System;

namespace ExampleApp
{
    public class ServiceProviderObjectCreator<T> : ObjectCreator<T>
    {
        readonly Type prototype;
        readonly IServiceProvider serviceProvider;

        public ServiceProviderObjectCreator(Type type, IServiceProvider serviceProvider)
        {
            this.prototype = type;
            this.serviceProvider = serviceProvider;
            Initialize(type);
        }

        public override T Create()
        {
            return (T)serviceProvider.GetService(this.prototype);
        }

        void Initialize(object obj)
        {
            Name = NameVersionHelper.GetDefaultName(obj);
            Version = NameVersionHelper.GetDefaultVersion(obj);
        }
    }
}
```

Previously you would have something that looks similar to this to add all your Orchestrations and Activities:

```csharp
await taskHubWorker
    .AddTaskOrchestrations(typeof(YourOrchestration))
    .AddTaskActivities(typeof(YourActivity))
    .StartAsync();
```

You can modify it by passing in an instance of ServiceProviderObjectCreator instead of the Type. The constructor for ServiceProviderObjectCreator takes the Type and an instance of IServiceProvider. IServiceProvider can be injected anywhere to get the instance for the current scope.

```csharp
await taskHubWorker
    .AddTaskOrchestrations(new ServiceProviderObjectCreator<TaskOrchestration>(typeof(YourOrchestration), serviceProvider))
    .AddTaskActivities(new ServiceProviderObjectCreator<TaskActivity>(typeof(YourActivity), serviceProvider))
    .StartAsync();
```

You'll also need to configure your Orchestrations and Activities where you configure your other services.

```csharp
services
    .AddTransient(typeof(YourOrchestration));
    .AddTransient(typeof(YourActivity));
```

Make sure to use the Transient lifetime so that Durable Task Framework can get a new instance each time it calls `Create()` on the ObjectCreator.

Now you can use normal constructor injection in your Task Orchestrations and Task Activities.
