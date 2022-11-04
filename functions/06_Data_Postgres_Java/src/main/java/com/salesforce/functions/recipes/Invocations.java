package com.salesforce.functions.recipes;

import java.util.List;

public class Invocations {
    private List<Invocation> invocations;

    public Invocations(List<Invocation> invocations) {
        this.invocations = invocations;
    }

    public List<Invocation> getInvocations() {
        return invocations;
    }
}
